// app/routes/index.tsx
import { createFileRoute, useNavigate, useRouter, useRouterState, useSearch } from '@tanstack/react-router'

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
    type RowData,
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
import { ark, ArkErrors, type } from 'arktype'
import { createTranslation, searchTranslations, updateTranslation, updateTranslationKey } from '@/server/translations'
import { Label } from '@/components/ui/label'

declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
        updateData: (rowIndex: number, columnId: string, value: unknown) => void
    }
}

// Give our default column cell renderer editing superpowers!
const defaultColumn: Partial<ColumnDef<TranslationType>> = {
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
        const initialValue = getValue()
        // We need to keep and update the state of the cell normally
        const [value, setValue] = React.useState(initialValue)

        // When the input is blurred, we'll call our table meta's updateData function
        const onBlur = () => {
            table.options.meta?.updateData(index, id, value)
        }

        // If the initialValue is changed external, sync it up with our state
        React.useEffect(() => {
            setValue(initialValue)
        }, [initialValue])

        return (
            <Input
                value={value as string}
                onChange={e => setValue(e.target.value)}
                onBlur={onBlur}
            />
        )
    },
}
const searchDef = type({
    "filter?": "string"
})

export const Route = createFileRoute('/')({
    validateSearch: searchDef,
    component: DataTableDemo,
    loader: async (opts) => await searchTranslations({ data: { filter: opts.location.search?.filter } }),
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
        // cell: ({ row }) => (
        //     <div>{row.getValue("key")}</div>
        // ),
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
        // cell: ({ row }) => <div>{row.getValue("translation")}</div>,
    }
]

export function DataTableDemo() {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const search = Route.useSearch();
    const { user } = Route.useRouteContext();
    const navigate = useNavigate({ from: Route.fullPath })

    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const { data, cursor } = Route.useLoaderData()
    const router = useRouter();
    const table = useReactTable({
        data,
        columns,
        defaultColumn,
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
        meta: {
            updateData: async (rowIndex, columnId, value) => {
                if (typeof value !== "string") return
                // Skip page index reset until after next rerender
                //   skipAutoResetPageIndex()
                const row = table.getRowModel().rows[rowIndex]
                if (columnId === "key") {
                    await updateTranslationKey({
                        data: {
                            ...row.original,
                            newKey: value,
                        }
                    })
                } else {
                    await updateTranslation({
                        data: {
                            ...row.original,
                            translation: value,
                        }
                    })
                }
                router.invalidate();
            },
        },

    })
    return (
        <div className="w-full">
            Hej, {user.email}
            <div className="flex space-x-2 py-4">
                <Input
                    placeholder="Filter keys..."
                    value={search.filter}
                    onChange={(event) =>
                        navigate({ search: { filter: event.target.value } })
                    }
                    className="max-w-sm"
                />
                <CreateTranslationDialog />
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

