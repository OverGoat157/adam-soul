"""
Алгоритм агрегации размеров в оптовые размерные сетки.

Группы размеров:
  - regular: 44–58, шаг 2
  - big:     60–66, шаг 2  (артикулы с «BS»)
  - zidan:   с ростом /194  (артикулы с «Zidan»)

Для каждой группы:
  1. Правило «по 1 шт.»: если ВСЕ размеры группы = 1 шт. и точно
     совпадают с предопределённой сеткой → показываем только эту сетку.
  2. Иначе: предопределённые сетки + фактические непрерывные диапазоны
     + предопределённые одиночные размеры.
  3. Сортировка: длинные сетки → короткие → одиночные.
"""

from collections import defaultdict


# ── Предопределённые сетки ────────────────────────────────────────
PREDEFINED_GRIDS = {
    'regular': [(44, 58), (46, 58), (48, 58), (48, 52), (44, 46)],
    'big':     [(60, 66), (60, 62)],
    'zidan':   [(48, 58), (48, 54), (52, 54)],
}

# Предопределённые одиночные размеры (показываются если есть в наличии)
PREDEFINED_INDIVIDUALS = {
    'regular': [44, 46, 48, 50, 56],
    'big':     [62],
    'zidan':   [],
}

SIZE_STEP = 2  # шаг размерного ряда


def _parse_size(size_str):
    """
    Разбирает строку размера → (base: int, group: str) или None.

    Примеры:
      '48'          → (48, 'regular')
      '48,182'      → (48, 'regular')
      '48\\176-182' → (48, 'regular')
      '48,194'      → (48, 'zidan')
      '48-194'      → (48, 'zidan')
      '62'          → (62, 'big')
    """
    s = size_str.strip()

    # Разделители: \  ,  /
    for sep in ('\\', ',', '/'):
        if sep in s:
            parts = s.split(sep, 1)
            base_str = parts[0].strip()
            height = parts[1].strip()
            if not base_str.isdigit():
                return None
            base = int(base_str)
            if '194' in height:
                return (base, 'zidan')
            return (base, 'big' if base >= 60 else 'regular')

    # Дефис: '48-194'
    if '-' in s:
        parts = s.split('-', 1)
        left, right = parts[0].strip(), parts[1].strip()
        if left.isdigit() and right.isdigit() and len(left) <= 2 and len(right) >= 3:
            base = int(left)
            if right == '194':
                return (base, 'zidan')
            return (base, 'big' if base >= 60 else 'regular')

    # Просто число
    if s.isdigit():
        base = int(s)
        return (base, 'big' if base >= 60 else 'regular')

    return None


def _continuous_ranges(sorted_sizes):
    """Разбивает отсортированный список на непрерывные диапазоны (шаг 2)."""
    if not sorted_sizes:
        return []
    ranges = []
    cur = [sorted_sizes[0]]
    for i in range(1, len(sorted_sizes)):
        if sorted_sizes[i] - sorted_sizes[i - 1] == SIZE_STEP:
            cur.append(sorted_sizes[i])
        else:
            ranges.append(cur)
            cur = [sorted_sizes[i]]
    ranges.append(cur)
    return ranges


def build_size_grids(sizes_list):
    """
    Принимает список {'size': str, 'stock': int}.
    Возвращает список строк-сеток, отсортированных по приоритету.

    Пример: ['44-58', '48-58', '48-52', '44-46', '44', '46', '48', '50', '56']
    """
    # 1. Парсим и группируем с учётом остатков
    groups = defaultdict(dict)  # group -> {base_size: total_stock}
    for s in sizes_list:
        if s.get('stock', 0) <= 0:
            continue
        parsed = _parse_size(s['size'])
        if parsed:
            base, group = parsed
            groups[group][base] = groups[group].get(base, 0) + s['stock']

    entries = []  # (range_length, start_size, label)

    for group_name in ('regular', 'big', 'zidan'):
        size_stocks = groups.get(group_name, {})
        if not size_stocks:
            continue

        base_sizes = sorted(size_stocks.keys())
        suffix = '/194' if group_name == 'zidan' else ''
        predefined = PREDEFINED_GRIDS.get(group_name, [])

        # ── Правило «по 1 шт.» ──
        # Если ВСЕ размеры имеют stock=1 И точно совпадают
        # с одной из предопределённых сеток → только эта сетка.
        if all(stock == 1 for stock in size_stocks.values()):
            base_set = set(base_sizes)
            found_single = False
            for start, end in sorted(predefined, key=lambda x: x[1] - x[0], reverse=True):
                grid_set = set(range(start, end + 1, SIZE_STEP))
                if grid_set == base_set:
                    entries.append((len(grid_set), start, f'{start}-{end}{suffix}'))
                    found_single = True
                    break
            if found_single:
                continue

        # ── Обычная логика ──

        # 2a. Предопределённые сетки
        for start, end in predefined:
            grid = list(range(start, end + 1, SIZE_STEP))
            if all(s in base_sizes for s in grid):
                entries.append((len(grid), start, f'{start}-{end}{suffix}'))

        # 2b. Фактические непрерывные диапазоны (≥2 размера)
        has_ranges = False
        for rng in _continuous_ranges(base_sizes):
            if len(rng) >= 2:
                entries.append((len(rng), rng[0], f'{rng[0]}-{rng[-1]}{suffix}'))
                has_ranges = True

        # 2c. Одиночные размеры
        if has_ranges:
            # Есть сетки → показываем только предопределённые одиночные
            for s in PREDEFINED_INDIVIDUALS.get(group_name, []):
                if s in size_stocks:
                    entries.append((1, s, f'{s}{suffix}'))
        else:
            # Нет сеток → показываем ВСЕ доступные размеры
            for s in base_sizes:
                entries.append((1, s, f'{s}{suffix}'))

    # 3. Сортировка: длинные сетки первыми, потом по начальному размеру
    entries.sort(key=lambda x: (-x[0], x[1]))

    # 4. Дедупликация с сохранением порядка
    seen = set()
    result = []
    for _, _, label in entries:
        if label not in seen:
            seen.add(label)
            result.append(label)

    return result
