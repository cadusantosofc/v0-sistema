import { NextResponse } from "next/server";
import { listUsers } from "../../../src/models/user";
import { getWalletByUserId } from "../../../src/models/wallet";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");

    // Busca usuários do banco
    const validRole = role === 'admin' || role === 'worker' || role === 'company' ? role : undefined;
    const users = await listUsers(validRole);

    // Adiciona saldo e avatar padrão para cada usuário
    const usersWithWallet = await Promise.all(
      users.map(async (user) => {
        // Busca carteira do usuário
        const wallet = await getWalletByUserId(user.id);

        // Remove senha do objeto
        const { password, ...userWithoutPassword } = user;

        return {
          ...userWithoutPassword,
          avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
          wallet: {
            balance: wallet?.balance || 0,
            status: wallet?.status || 'inactive'
          }
        };
      })
    );

    return NextResponse.json(usersWithWallet);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
