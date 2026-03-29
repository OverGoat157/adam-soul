"""
Алгоритм агрегации размеров в оптовые размерные сетки.

Группы размеров:
  - regular: 44–58, шаг 2
  - big:     60–66, шаг 2  (артикулы с «BS»)
  - zidan:   с ростом /194  (артикулы с «Zidan»)

Для каждой группы:
  1. Проверяем предопределённые сетки (44-58, 46-58, 48-58, …)
  2. Строим фактические непрерывные диапазоны из наличия
  3. Добавляем одиночные размеры
  4. Сортируем: длинные сетки → короткие → одиночные
"""

from collections import defaultdict


# ── Предопределённые сетки ────────────────────────────────────────
PREDEFINED_GRIDS = {
    'regular': [(44, 58), (46, 58), (48, 58), (44, 46)],
    'big':     [(60, 66), (60, 62)],
    'zidan':   [(48, 58), (48, 54), (52, 54)],
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
            # 194 в части роста → zidan
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

    Пример вывода: ['44-58', '48-58', '46-58', '44-46', '46', '48', '50', '56']
    """
    # 1. Парсим и группируем
    groups = defaultdict(set)
    for s in sizes_list:
        if s.get('stock', 0) <= 0:
            continue
        parsed = _parse_size(s['size'])
        if parsed:
            base, group = parsed
            groups[group].add(base)

    # (range_length, start_size, label) — для сортировки
    entries = []

    for group_name in ('regular', 'big', 'zidan'):
        base_sizes = sorted(groups.get(group_name, set()))
        if not base_sizes:
            continue

        suffix = '/194' if group_name == 'zidan' else ''

        # 2a. Предопределённые сетки
        for start, end in PREDEFINED_GRIDS.get(group_name, []):
            grid = list(range(start, end + 1, SIZE_STEP))
            if all(s in base_sizes for s in grid):
                label = f'{start}-{end}{suffix}'
                entries.append((len(grid), start, label))

        # 2b. Фактические непрерывные диапазоны (≥2 размера)
        for rng in _continuous_ranges(base_sizes):
            if len(rng) >= 2:
                label = f'{rng[0]}-{rng[-1]}{suffix}'
                entries.append((len(rng), rng[0], label))

        # 2c. Одиночные размеры
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
