import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getUserById, updateUser } from "../../../../src/models/user"
import { getWalletByUserId } from "../../../../src/models/wallet"

export async function GET() {
  const cookieStore = await cookies()
  const userCookie = cookieStore.get('user')

  if (!userCookie) {
    return NextResponse.json(
      { error: "Não autenticado" },
      { status: 401 }
    )
  }

  try {
    const { id } = JSON.parse(userCookie.value)
    const user = await getUserById(id)

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }
    
    // Busca a carteira do usuário
    const wallet = await getWalletByUserId(id)
    
    // Remove a senha do objeto
    const { password, ...userWithoutPassword } = user
    
    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
        wallet: wallet?.balance || 0
      }
    })
  } catch (error) {
    console.error("Erro ao buscar usuário:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const data = await request.json()
    const { userId, ...updates } = data

    // Atualiza o usuário no MySQL
    const updatedUser = await updateUser(userId, updates)

    if (!updatedUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }
    
    // Remove a senha do objeto
    const { password, ...userWithoutPassword } = updatedUser
    
    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        avatar: updatedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedUser.name)}&background=random`
      }
    })
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
