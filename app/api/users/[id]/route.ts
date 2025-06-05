import { NextResponse } from "next/server"
import { getUserById, updateUser } from "../../../../src/models/user"
import { getWalletByUserId } from "../../../../src/models/wallet"
import { getReviewsByUserId } from '../../../../src/models/review'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await params.id;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }
    
    console.log(`API: Buscando usuário com ID: ${userId}`);
    
    try {
      // Busca o usuário no banco de dados
      const user = await getUserById(userId);
      
      if (!user) {
        console.log(`API: Usuário não encontrado: ${userId}`);
        
        // Se for uma empresa, retorna um objeto padrão para evitar erros no frontend
        if (userId.startsWith('company-')) {
          const defaultCompany = {
            id: userId,
            name: `Empresa ${userId.split('-')[1] || ''}`,
            email: 'empresa@exemplo.com',
            role: 'company',
            avatar: '/placeholder.svg',
            bio: 'Informações da empresa não disponíveis',
            averageRating: 0,
            reviewCount: 0,
            wallet: 0
          };
          
          console.log(`API: Retornando empresa padrão para: ${userId}`);
          return NextResponse.json(defaultCompany);
        }
        
        return NextResponse.json(
          { error: "Usuário não encontrado" },
          { status: 404 }
        );
      }
      
      // Busca a carteira do usuário
      const wallet = await getWalletByUserId(userId);
      
      // Remove a senha do objeto
      const { password, ...safeUserData } = user;
      
      // Buscar avaliações recebidas pelo usuário
      let reviews = [];
      let averageRating = 0;
      
      try {
        reviews = await getReviewsByUserId(userId);
        
        // Calcular média de avaliações
        averageRating = reviews.length > 0
          ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
          : 0;
      } catch (reviewError) {
        console.error("Erro ao buscar avaliações:", reviewError);
        // Não vamos interromper o fluxo, apenas deixar avaliações vazias
      }
      
      // Retorna o usuário com informações adicionais
      return NextResponse.json({
        ...safeUserData,
        averageRating,
        reviewCount: reviews.length,
        avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`,
        wallet: wallet?.balance || 0
      });
    } catch (dbError) {
      console.error("Erro ao acessar o banco de dados:", dbError);
      
      // Se for uma empresa, retorna um objeto padrão para evitar erros no frontend
      if (userId.startsWith('company-')) {
        const defaultCompany = {
          id: userId,
          name: `Empresa ${userId.split('-')[1] || ''}`,
          email: 'empresa@exemplo.com',
          role: 'company',
          avatar: '/placeholder.svg',
          bio: 'Erro ao acessar informações da empresa',
          averageRating: 0,
          reviewCount: 0,
          wallet: 0
        };
        
        console.log(`API: Retornando empresa padrão devido a erro de DB: ${userId}`);
        return NextResponse.json(defaultCompany);
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error("Erro ao carregar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao carregar usuário" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const data = await request.json();
    
    // Atualiza o usuário no banco de dados
    const updatedUser = await updateUser(userId, data);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: "Usuário não encontrado ou dados inválidos" },
        { status: 404 }
      );
    }
    
    // Remove a senha do objeto
    const { password, ...userWithoutPassword } = updatedUser;
    
    return NextResponse.json({
      user: {
        ...userWithoutPassword,
        avatar: updatedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(updatedUser.name)}&background=random`
      }
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    )
  }
}
