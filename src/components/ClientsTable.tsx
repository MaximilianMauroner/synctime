import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Client } from "@/lib/types/client";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ClientTableProps {
    clients: Client[];
    onClientDeleteRequest: (clientId: string) => void;
}

export default function ClientsTable({ clients, onClientDeleteRequest }: ClientTableProps) {
    const { t } = useTranslation();

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{t("homePage:idTableColumn")}</TableHead>
                    <TableHead>{t("homePage:nameTableColumn")}</TableHead>
                    <TableHead>{t("homePage:emailTableColumn")}</TableHead>
                    <TableHead>{t("homePage:actionTableColumn")}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {clients.map((client) => (
                    <TableRow key={client.id}>
                        <TableCell>{client.id}</TableCell>
                        <TableCell>{client.name}</TableCell>
                        <TableCell>{client.email}</TableCell>
                        <TableCell>
                            <Button
                                size={"icon"}
                                variant={"ghost"}
                                onClick={() => onClientDeleteRequest(client.id)}
                            >
                                <Trash2 size={16} />
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
