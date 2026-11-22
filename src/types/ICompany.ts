
export interface Company {
    id: number;
    name: string;
    description: string | null;
    website: string | null;
    location: string | null;
    ownerId: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCompanyInput {
    name: string;
    description?: string;
    website?: string;
    location?: string;
}

export type UpdateCompanyInput = Partial<CreateCompanyInput>;
