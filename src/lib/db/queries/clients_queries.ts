import { db } from "../db_client";
import { generateUuid } from "@/lib/cripto";
import { eq } from "drizzle-orm";
import { clients } from "../schema";

export interface CreateClient {
    name: string;
    email: string;
}

export async function createNewClient(clientData: CreateClient) {
    const id = generateUuid();
    const result = await db
        .insert(clients)
        .values([
            {
                id: id,
                name: clientData.name,
                email: clientData.email,
            },
        ])
        .returning();

    return result[0];
}

export async function getAllClients() {
    const result = await db.select().from(clients);

    return result;
}

export async function deleteClient(clientId: string) {
    await db.delete(clients).where(eq(clients.id, clientId));

    return clientId;
}
