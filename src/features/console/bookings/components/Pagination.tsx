import { Icon } from '@/components/icons';
import { IconButton } from '@/components/ui';

import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  pageSizes: readonly number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function Pagination({
  page,
  pageSize,
  total,
  pageSizes,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const first = total ? page * pageSize + 1 : 0;
  const last = Math.min(total, (page + 1) * pageSize);

  return (
    <div className={styles.pagination}>
      <label className={styles.pageSize}>
        Rows per page
        <span className={styles.selectWrap}>
          <select
            className={styles.select}
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <Icon name="chevronDown" size={14} className={styles.selectIcon} />
        </span>
      </label>
      <span className={styles.pager}>
        <span aria-live="polite" className={styles.range}>
          {first.toLocaleString('en-US')}–{last.toLocaleString('en-US')} of {total.toLocaleString('en-US')}
        </span>
        <IconButton
          icon="chevronLeft"
          label="Previous page"
          variant="outline"
          shape="square"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
        />
        <IconButton
          icon="chevronRight"
          label="Next page"
          variant="outline"
          shape="square"
          disabled={page >= pageCount - 1}
          onClick={() => onPageChange(page + 1)}
        />
      </span>
    </div>
  );
}
