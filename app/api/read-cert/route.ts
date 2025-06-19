import { NextRequest, NextResponse } from 'next/server';
import * as forge from 'node-forge';

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const file = formData.get('cert') as File;
    const password = formData.get('password') as string;

    if (!file) {
        return NextResponse.json({ error: 'Missing file' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    try {
        const p12Der = forge.util.createBuffer(buffer.toString('binary'));
        const p12Asn1 = forge.asn1.fromDer(p12Der);
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });

        const bags = certBags?.[forge.pki.oids.certBag as unknown as number];

        if (!Array.isArray(bags) || bags.length === 0) {
            return NextResponse.json({ error: 'No se encontró ningún certificado válido en el archivo.' }, { status: 400 });
        }

        const cert = bags[0].cert;
        const date = new Date(cert.validity.notAfter);
        const iso = date.toISOString(); // ejemplo: "2025-12-11T14:39:00.000Z"

        return NextResponse.json({ expiresAt: iso });
    } catch (error) {
        return NextResponse.json({ error: 'Error reading certificate', details: error }, { status: 500 });
    }
}
