# backend/catalog/exchange_views.py
import os
import base64
import logging
import xml.etree.ElementTree as ET

from django.conf import settings
from django.contrib.auth import authenticate, login
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone

from .models import SyncLog
from .commerceml_parser import sync_categories_from_tree, sync_products_from_tree, sync_offers_from_tree

logger = logging.getLogger(__name__)

EXCHANGE_DIR = os.path.join(settings.MEDIA_ROOT, '1c_exchange_tmp')
IMAGES_DIR = os.path.join(settings.MEDIA_ROOT, '1c_images')


def make_response(text, status=200):
    """Return plain text response as 1C expects."""
    return HttpResponse(text, content_type='text/plain; charset=utf-8', status=status)


def check_session_auth(request):
    """Verify the request is authenticated via session (after checkauth)."""
    return request.user and request.user.is_authenticated and request.user.is_staff


@csrf_exempt
def exchange_1c(request):
    """Main dispatcher for 1C CommerceML exchange protocol."""
    mode = request.GET.get('mode', '')
    exchange_type = request.GET.get('type', '')

    logger.info(f"1C exchange: type={exchange_type}, mode={mode}")

    # --- CHECKAUTH ---
    if mode == 'checkauth':
        return handle_checkauth(request)

    # All subsequent modes require session auth
    if not check_session_auth(request):
        return make_response('failure\nНе авторизован', 401)

    # --- INIT ---
    if mode == 'init':
        return handle_init()
    # --- FILE ---
    elif mode == 'file':
        return handle_file(request)
    # --- IMPORT ---
    elif mode == 'import':
        return handle_import(request)
    # --- DEACTIVATE ---
    elif mode == 'deactivate':
        return handle_deactivate()
    # --- COMPLETE ---
    elif mode == 'complete':
        return handle_complete()
    else:
        return make_response(f'failure\nНеизвестный режим: {mode}', 400)


def handle_checkauth(request):
    """
    Basic Auth -> create session -> return cookie name and value.
    1C expects response:
        success
        <cookie_name>
        <cookie_value>
    """
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if not auth_header.startswith('Basic '):
        response = make_response('failure\nНеобходима Basic авторизация', 401)
        response['WWW-Authenticate'] = 'Basic realm="1C Exchange"'
        return response

    try:
        decoded = base64.b64decode(auth_header[6:]).decode('utf-8')
        username, password = decoded.split(':', 1)
    except Exception:
        return make_response('failure\nОшибка декодирования авторизации')

    user = authenticate(request, username=username, password=password)
    if user is None or not user.is_staff:
        return make_response('failure\nНеверные учетные данные')

    login(request, user)

    session_key = request.session.session_key
    cookie_name = settings.SESSION_COOKIE_NAME

    logger.info(f"1C exchange: checkauth success for user {username}")
    return make_response(f'success\n{cookie_name}\n{session_key}')


def handle_init():
    """
    Return zip support and file size limit.
    1C expects:
        zip=no
        file_limit=<bytes>
    """
    os.makedirs(EXCHANGE_DIR, exist_ok=True)
    os.makedirs(IMAGES_DIR, exist_ok=True)

    logger.info("1C exchange: init")
    return make_response('zip=no\nfile_limit=0')


def handle_file(request):
    """
    Receive an uploaded file (XML or image).
    filename comes as GET parameter.
    Body contains the raw file content.
    """
    filename = request.GET.get('filename', '')
    if not filename:
        return make_response('failure\nОтсутствует имя файла')

    # Security: prevent path traversal
    safe_filename = os.path.normpath(filename).lstrip(os.sep)
    if '..' in safe_filename:
        return make_response('failure\nНедопустимое имя файла')

    # Determine destination: images go to IMAGES_DIR, XML goes to EXCHANGE_DIR
    ext = os.path.splitext(safe_filename)[1].lower()
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'}

    if ext in image_extensions:
        dest_path = os.path.join(IMAGES_DIR, safe_filename)
    else:
        dest_path = os.path.join(EXCHANGE_DIR, safe_filename)

    os.makedirs(os.path.dirname(dest_path), exist_ok=True)

    # Write file content from request body
    with open(dest_path, 'wb') as f:
        f.write(request.body)

    file_size = os.path.getsize(dest_path)
    logger.info(f"1C exchange: received file {safe_filename} ({file_size} bytes)")
    return make_response('success')


def handle_import(request):
    """
    Parse and import an uploaded XML file.
    filename comes as GET parameter.
    """
    filename = request.GET.get('filename', '')
    if not filename:
        return make_response('failure\nОтсутствует имя файла')

    safe_filename = os.path.normpath(filename).lstrip(os.sep)
    file_path = os.path.join(EXCHANGE_DIR, safe_filename)

    if not os.path.exists(file_path):
        return make_response(f'failure\nФайл не найден: {safe_filename}')

    log = SyncLog.objects.create(status='running')

    try:
        tree = ET.parse(file_path)
        root = tree.getroot()

        # Determine the site base URL for constructing image URLs
        site_url = getattr(settings, 'SITE_URL', '')
        if not site_url:
            site_url = request.build_absolute_uri('/').rstrip('/')
        media_url_prefix = f"{site_url}{settings.MEDIA_URL}1c_images/"

        if 'import' in safe_filename.lower():
            # import.xml contains categories and products
            cat_count = sync_categories_from_tree(root)
            prod_count = sync_products_from_tree(root, image_url_prefix=media_url_prefix)
            log.categories_synced = cat_count
            log.products_synced = prod_count
            logger.info(f"1C exchange: imported {cat_count} categories, {prod_count} products")
        elif 'offers' in safe_filename.lower():
            # offers.xml contains prices and stock
            sync_offers_from_tree(root)
            logger.info("1C exchange: imported offers (prices and stock)")
        else:
            # Try to detect content from XML structure
            ns = 'urn:1C.ru:commerceml_2'
            classifier = root.find(f'{{{ns}}}Классификатор')
            catalog = root.find(f'{{{ns}}}Каталог')
            offers_package = root.find(f'{{{ns}}}ПакетПредложений')

            if classifier is not None or catalog is not None:
                cat_count = sync_categories_from_tree(root)
                prod_count = sync_products_from_tree(root, image_url_prefix=media_url_prefix)
                log.categories_synced = cat_count
                log.products_synced = prod_count

            if offers_package is not None:
                sync_offers_from_tree(root)

        log.status = 'success'
        log.finished_at = timezone.now()
        log.save()

        return make_response('success')

    except Exception as e:
        logger.error(f"1C exchange: import error for {safe_filename}: {e}")
        log.status = 'error'
        log.error_message = str(e)
        log.finished_at = timezone.now()
        log.save()
        return make_response(f'failure\n{str(e)}')


def handle_deactivate():
    """
    Optional: deactivate products not present in the last exchange.
    For safety, we log but do not auto-deactivate.
    """
    logger.info("1C exchange: deactivate step (no-op)")
    return make_response('success')


def handle_complete():
    """
    Signal end of exchange. Clean up temp XML files (keep images).
    """
    if os.path.exists(EXCHANGE_DIR):
        for dirpath, dirnames, filenames in os.walk(EXCHANGE_DIR):
            for f in filenames:
                try:
                    os.remove(os.path.join(dirpath, f))
                except OSError:
                    pass

    logger.info("1C exchange: complete")
    return make_response('success')
