'use client';

import { Column } from '@tanstack/react-table';
import React, { useCallback } from 'react';
import { DateRange } from 'react-day-picker';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';

import { DataTableInputPopover } from './data-table-input-popover';
import { DataTableSelectPopover } from './data-table-select-popover';

interface DataTableFacetedFilterProps<TData, TValue> {
  type: 'select' | 'input' | 'date';
  column?: Column<TData, TValue>;
  title?: string;
  options: readonly {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

export function DataTableFacetedFilter<TData, TValue>({
  type,
  column,
  title,
  options,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleFilterChange = useCallback(
    (filterValue: string | string[] | DateRange | undefined) => {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete(column?.id as string);
      newParams.delete(`${column?.id}After`);
      newParams.delete(`${column?.id}Before`);
      newParams.delete('cursor');

      if (filterValue) {
        if (Array.isArray(filterValue)) {
          filterValue.forEach((value) => newParams.append(column?.id as string, value));
        } else if (typeof filterValue === 'object' && filterValue !== null) {
          if (filterValue.from) {
            newParams.append(`${column?.id}After`, filterValue.from.toISOString());
          }
          if (filterValue.to) {
            newParams.append(`${column?.id}Before`, filterValue.to.toISOString());
          }
        } else {
          newParams.append(column?.id as string, filterValue);
        }
      }

      router.push(`${pathname}?${newParams.toString()}`);
      column?.setFilterValue(filterValue || undefined);
    },
    [column, searchParams, pathname, router],
  );

  switch (type) {
    case 'input': {
      const filterValue = searchParams.get(column?.id as string) || '';
      return (
        <DataTableInputPopover
          title={title}
          filterValue={filterValue}
          handleFilterChange={handleFilterChange}
        />
      );
    }
    case 'select': {
      const filterValue = column?.getFilterValue() as string[];
      const selectedValues = new Set(filterValue);
      return (
        <DataTableSelectPopover
          title={title}
          selectedValues={selectedValues}
          options={options}
          handleFilterChange={handleFilterChange}
          facets={column?.getFacetedUniqueValues()}
        />
      );
    }
    case 'date': {
      const from = searchParams.get(`${column?.id}After`);
      const to = searchParams.get(`${column?.id}Before`);

      return (
        // Replace with your actual Date Picker component
        <>Date picker goes here (from: {from}, to: {to})</>
      );
    }
  }
}