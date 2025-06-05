import { NextRequest, NextResponse } from "next/server";
import { createWalletRequest } from "@/src/models/wallet-request";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await request.formData();
    const type = data.get("type") as "deposit" | "withdrawal";
    const amount = parseFloat(data.get("amount") as string);
    const receipt = data.get("receipt") as File;

    if (!type || !amount || (type === "deposit" && !receipt)) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    // Se for depósito, fazer upload do comprovante
    let receiptUrl = undefined;
    if (receipt) {
      // TODO: Implementar upload do arquivo
      // Por enquanto só salvamos o nome
      receiptUrl = receipt.name;
    }

    const walletRequest = await createWalletRequest(
      session.user.id,
      type,
      amount,
      receiptUrl
    );

    return NextResponse.json(walletRequest);
  } catch (error) {
    console.error("Erro ao criar solicitação:", error);
    return NextResponse.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
}
