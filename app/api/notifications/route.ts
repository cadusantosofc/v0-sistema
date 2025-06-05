import { NextResponse } from 'next/server';
import { createNotification, getNotificationsByUserId, markNotificationAsRead } from '../../../src/models/notification';
import { getUserById } from '../../../src/models/user';

// GET /api/notifications?userId=123
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário existe
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    // Buscar notificações do usuário
    const notifications = await getNotificationsByUserId(userId);
    
    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/notifications
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { user_id, title, message, type, related_id, related_type } = data;
    
    // Validações
    if (!user_id || !title || !message) {
      return NextResponse.json(
        { error: 'Campos user_id, title e message são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário existe
    const user = await getUserById(user_id);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    // Criar notificação
    const notification = await createNotification({
      user_id,
      title,
      message,
      type: type || 'info',
      related_id: related_id || null,
      related_type: related_type || null,
      is_read: false
    });
    
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications
export async function PATCH(request: Request) {
  try {
    const { id, is_read } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID da notificação é obrigatório' },
        { status: 400 }
      );
    }
    
    // Marcar notificação como lida
    const updated = await markNotificationAsRead(id, is_read === true);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Falha ao atualizar notificação' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar notificação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
} 