// app/routes/index.tsx
import { createFileRoute, useRouter } from '@tanstack/react-router'

import * as React from "react"
import { TranslationDefinition, type TranslationType } from "@sst-i18n/core/translation.definition"
import { useForm } from '@tanstack/react-form'

import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog'
import { ArkErrors } from 'arktype'
import { createTranslation, getTranslations } from '@/server/translations'
import { Label } from '@/components/ui/label'



export const Route = createFileRoute('/')({
    component: DataTableDemo,
    loader: async () => await getTranslations(),
})



export const columns: ColumnDef<TranslationType>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "key",
        header: "Key",
        cell: ({ row }) => (
            <div>{row.getValue("key")}</div>
        ),
    },
    {
        accessorKey: "translation",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Translation
                    <ArrowUpDown />
                </Button>
            )
        },
        cell: ({ row }) => <div>{row.getValue("translation")}</div>,
    }
]

export function DataTableDemo() {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const { data, cursor } = Route.useLoaderData()

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },

    })
    return (
        <div className="w-full">
            <div className="flex space-x-2 py-4">
                <Input
                    placeholder="Filter keys..."
                    value={(table.getColumn("key")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("key")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <div className='space-x-2'>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Columns <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <CreateTranslationDialog />
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}



const CreateTranslationDialog = () => {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();
    const form = useForm({
        defaultValues: {
            key: '',
            translation: '',
            language: 'sv',
            projectId: 'ifsek',
            version: 'latest',
            namespace: "default"
        },
        validators: {
            onChange: ({ value }) => {
                const res = TranslationDefinition(value);
                if (res instanceof ArkErrors) {
                    const fields = res.reduce((acc, curr) => {
                        return ({
                            ...acc,
                            [curr.path.toString()]: curr.message
                        })
                    }, {})
                    return {
                        form: "Invalid data",
                        fields,
                    }
                }
                return undefined;

            }
        },
        onSubmit: async ({ value, formApi }) => {
            await createTranslation({ data: value });
            router.invalidate();
            formApi.reset();
            setOpen(false);

        },
    })
    return (

        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>

                <Button>Create translation</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Translation</DialogTitle>
                    <DialogDescription>
                        This dialog allows you to create a new translation.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    form.handleSubmit();
                }}>
                    <div>
                        <Label>Key</Label>
                        <form.Field name="key" >
                            {(field) => (<div>
                                <Input name={field.name} value={field.state.value} onChange={e => field.handleChange(e.target.value)} />
                                {field.state.meta.errors ? (
                                    <em role="alert">{field.state.meta.errors.join(', ')}</em>
                                ) : null}
                            </div>
                            )}
                        </form.Field>

                        <Label>Translation</Label>
                        <form.Field name="translation" >
                            {(field) => (<div>
                                <Input name={field.name} value={field.state.value} onChange={e => field.handleChange(e.target.value)} />
                                {field.state.meta.errors ? (
                                    <em role="alert">{field.state.meta.errors.join(', ')}</em>
                                ) : null}
                            </div>
                            )}
                        </form.Field>
                        <DialogFooter className="mt-2">

                            <Button type="submit">Create</Button>
                            <DialogClose asChild>
                                <Button variant={"secondary"}>Cancel</Button>
                            </DialogClose>
                        </DialogFooter>
                    </div>

                </form>
            </DialogContent>
        </Dialog>
    )

}

