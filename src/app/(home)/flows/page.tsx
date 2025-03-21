'use client'
import { ColumnDef } from '@tanstack/react-table';
import {
  CheckIcon,
  ChevronDown,
  EllipsisVertical,
  Import,
  Plus,
  Workflow,
} from 'lucide-react';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { useEmbedding, useNewWindow } from '@/components/embed-provider';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable, RowDataWithActions } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import { FlowStatus, Permission, PopulatedFlow } from '../../../../shared/src';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { INTERNAL_ERROR_TOAST, toast } from '@/components/ui/use-toast';
import { TableTitle } from '@/components/ui/table-title';
import { formatUtils } from '@/lib/utils';

const filters = [
  {
    type: 'input',
    title: 'flow name',
    accessorKey: 'name',
    options: [],
    icon: CheckIcon,
  } as const,
  {
    type: 'select',
    title: 'status',
    accessorKey: 'status',
    options: Object.values(FlowStatus).map((status) => {
      return {
        label: formatUtils.convertEnumToHumanReadable(status),
        value: status,
      };
    }),
    icon: CheckIcon,
  } as const,
];

export default function FlowsPage() {
  const { embedState } = useEmbedding();
  const router = useRouter();
  const [refresh, setRefresh] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const openNewWindow = useNewWindow();
  const [searchParam]= useSearchParams();

  const data = {
    data: [
      {
        id: "flow_001",
        externalId: "ext_001",
        name: "Customer Onboarding",
        steps: ["Verify Email", "Create Profile"],
        folderId: "folder_123",
        created: "2024-03-01T12:00:00Z",
        updated: "2024-03-02T12:00:00Z",
        status: "active",
        projectId: "project_001",
        schedule: null, // Assuming schedule isn't needed here
        version: {
          displayName: "Customer Onboarding",
          trigger: "Manual",
        },
      },
      {
        id: "flow_002",
        externalId: "ext_002",
        name: "Order Processing",
        steps: ["Check Inventory", "Process Payment"],
        folderId: "folder_456",
        created: "2024-02-15T08:30:00Z",
        updated: "2024-02-16T08:30:00Z",
        status: "inactive",
        projectId: "project_002",
        schedule: {
          failureCount: 0,
          type: "Recurring",
          cronExpression: "0 0 * * *", // Runs daily
          timezone: "UTC",
        },
        version: {
          displayName: "Customer Onboarding",
          trigger: "Webhook",
        },
      },
      {
        id: "flow_001",
        externalId: "ext_001",
        name: "Customer Onboarding",
        steps: ["Verify Email", "Create Profile"],
        folderId: "folder_123",
        created: "2024-03-01T12:00:00Z",
        updated: "2024-03-02T12:00:00Z",
        status: "active",
        projectId: "project_001",
        schedule: null, // Assuming schedule isn't needed here
        version: {
          displayName: "Customer Onboarding",
          trigger: "Manual",
        },
      },
      {
        id: "flow_001",
        externalId: "ext_001",
        name: "Customer Onboarding",
        steps: ["Verify Email", "Create Profile"],
        folderId: "folder_123",
        created: "2024-03-01T12:00:00Z",
        updated: "2024-03-02T12:00:00Z",
        status: "active",
        projectId: "project_001",
        schedule: null, // Assuming schedule isn't needed here
        version: {
          displayName: "Customer Onboarding",
          trigger: "Manual",
        },
      },
      {
        id: "flow_001",
        externalId: "ext_001",
        name: "Customer Onboarding",
        steps: ["Verify Email", "Create Profile"],
        folderId: "folder_123",
        created: "2024-03-01T12:00:00Z",
        updated: "2024-03-02T12:00:00Z",
        status: "active",
        projectId: "project_001",
        schedule: null, // Assuming schedule isn't needed here
        version: {
          displayName: "Customer Onboarding",
          trigger: "Manual",
        },
      },
      {
        id: "flow_001",
        externalId: "ext_001",
        name: "Customer Onboarding",
        steps: ["Verify Email", "Create Profile"],
        folderId: "folder_123",
        created: "2024-03-01T12:00:00Z",
        updated: "2024-03-02T12:00:00Z",
        status: "active",
        projectId: "project_001",
        schedule: null, // Assuming schedule isn't needed here
        version: {
          displayName: "Customer Onboarding",
          trigger: "Manual",
        },
      },
    ],
    next: "cursor_002",
    previous: null,
  };
  
  //TODO: Add type to flow (populatedFlow) instead of any
  const [selectedRows, setSelectedRows] = useState<Array<PopulatedFlow>>([])

  const columns: (ColumnDef<RowDataWithActions<PopulatedFlow>> & {
    accessorKey: string;
  })[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            table.getIsSomePageRowsSelected()
          }
          onCheckedChange={(value) => {
            const isChecked = !!value;
            table.toggleAllPageRowsSelected(isChecked);

            if (isChecked) {
              const allRowIds = table
                .getRowModel()
                .rows.map((row) => row.original);

              const newSelectedRowIds = [...allRowIds, ...selectedRows];

              const uniqueRowIds = Array.from(
                new Map(
                  newSelectedRowIds.map((item) => [item.id, item]),
                ).values(),
              );

              setSelectedRows(uniqueRowIds);
            } else {
              const filterdRowIds = selectedRows.filter((row) => {
                return !table
                  .getRowModel()
                  .rows.some((r) => r.original.version.id === row.version.id);
              });
              setSelectedRows(filterdRowIds);
            }
          }}
        />
      ),
      cell: ({ row }) => {
        const isChecked = selectedRows.some(
          (selectedRow) =>
            selectedRow.id === row.original.id &&
            selectedRow.status === row.original.status,
        );

        return (
          <div className='text-left min-w-[30px]'>
          <Checkbox
            checked={isChecked}
            onCheckedChange={(value) => {
              const isChecked = !!value;
              let newSelectedRows = [...selectedRows];
              if (isChecked) {
                const exists = newSelectedRows.some(
                  (selectRow) => selectRow.id === row.original.id,
                );
                if (!exists) {
                  newSelectedRows.push(row.original);
                }
              } else {
                newSelectedRows = newSelectedRows.filter(
                  (selectedRow) => selectedRow.id !== row.original.id,
                );
              }
              setSelectedRows(newSelectedRows);
              row.toggleSelected(!!value);
            }}
          />
          </div>
        );
      },
      accessorKey: 'select',
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Name'/>
      ),
      cell: ({ row }) => {
        const status = row.original.version.displayName;
        return <div className="text-left min-w-[150px] mr-10">{status}</div>
      },
    },
    {
      accessorKey: 'steps',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Steps'/>
      ),
      cell: ({ row }) => {
        return (
          //TODO - ADD PieceIconList
          <div className='flex min-w-[150px]'>
            <Workflow/>
            <div className='m-1'></div>
            <Workflow/>
          </div>
        );
      },
    }, 
    {
      accessorKey: 'folderId',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Folder' />
      ),
      cell: ({ row }) => {
        const folderId = row.original.folderId;

        return (
          <div className="text-left min-w-[150px]">
            {folderId ? (
              <span>Uncategorized</span>
              //TODO: ADD FOLDER 
              // <FolderBadge />
            ):(
              <span>Uncategorized</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'created',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Created' />
      ),
      cell: ({ row }) => {
        const created = row.original.created;
        return (
          <div className='text-left font-medium min-w-[150px]'>
            {formatUtils.formatDate(new Date(created))}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Status'/>
      ),
      cell: ({ row }) => {
        return (
          <div
            className='flex items-center space-x-2 min-w-[150px]'
            onClick={(e) => e.stopPropagation()}
          >
            {/* TODO: Status Toggle */}
            Toggle
          </div>
        );
      },
    },
    {
      accessorKey: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title=''/>
      ),
      cell: ({ row }) => {
        const flow = row.original;
        return (
          <div onClick={(e) => e.stopPropagation()}>
           {/* TODO: FlowActionMenu */}
           <EllipsisVertical className='h-4 w-4'/>
          </div>
        );
      },
    },
  ];

  //TODO : Bulk Actions

  const bulkActions:any[] = [];

  return (
    <div className='flex flex-col gap-4 grow mr-30 ml-30'>
      <div className="flex flex-col gap-4 w-full grow">
        <div className="flex  w-full">
          <TableTitle>Flows</TableTitle>
          <div className="ml-auto flex flex-row gap-2">
            <Button
              variant="outline"
              className="flex gap-2 items-center"
            >
              <Import className='w-4 h-4'/>
              <span>Import Flow</span>
            </Button>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='default'
                  className='flex gap-2 items-center'
                >
                  <span>New Flow</span>
                  <ChevronDown className='h-4 w-4'/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    router.push("/new-flow")
                  }}
                >
                  <Plus className='h-4 w-4 me-2'/>
                  <span>From Scratch</span>
                </DropdownMenuItem>
                
                {/* TODO: SELECT FLOW TEMPLATE */}
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                >
                  <Workflow className='h-4 w-4 me-2'/>
                  <span>Use a template</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div>
          {/* FOLDERS */}
          <div className='w-full'>
            <DataTable
              columns={columns.filter(
                (column) =>
                  !embedState.hideFolders || column.accessorKey !== 'folderId',
              )}
              //@ts-ignore
              page={data}
              isLoading={false}
              filters={filters}
              bulkActions={bulkActions}
              onRowClick={(row,) => {
                router.push(`/flows/${row.id}`)
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
