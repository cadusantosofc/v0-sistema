import { NextResponse } from "next/server";
import { createChat, getChatById, getChatsByUserId, getChatsByJobId } from "../../../src/models/chat";
import { createMessage, getMessagesByChatId } from "../../../src/models/message";
import { getUserById } from "../../../src/models/user";
import { getJobById } from "../../../src/models/job";

export async function POST(request: Request) {
  try {
    const { jobId, companyId, workerId, companyName, workerName, jobTitle } = await request.json();

    // Validações
    if (!jobId || !companyId || !workerId) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    // Verifica se usuários existem
    const [company, worker] = await Promise.all([
      getUserById(companyId),
      getUserById(workerId)
    ]);

    if (!company || !worker) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se vaga existe
    const job = await getJobById(jobId);
    if (!job) {
      return NextResponse.json(
        { error: "Vaga não encontrada" },
        { status: 404 }
      );
    }

    // Cria um novo chat
    const chat = await createChat({
      job_id: jobId,
      company_id: companyId,
      worker_id: workerId,
      company_name: companyName || company.name,
      worker_name: workerName || worker.name,
      job_title: jobTitle || job.title,
      status: 'active'
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Erro ao criar chat:', error);
    return NextResponse.json(
      { error: "Erro ao criar chat" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    const userId = searchParams.get('userId');
    const jobId = searchParams.get('jobId');

    if (chatId) {
      // Busca um chat específico e suas mensagens
      const [chat, messages] = await Promise.all([
        getChatById(chatId),
        getMessagesByChatId(chatId)
      ]);

      if (!chat) {
        return NextResponse.json(
          { error: "Chat não encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({ chat, messages });
    } 
    else if (userId) {
      // Busca todos os chats do usuário
      const chats = await getChatsByUserId(userId);
      return NextResponse.json({ chats });
    }
    else if (jobId) {
      // Busca todos os chats da vaga
      const chats = await getChatsByJobId(jobId);
      return NextResponse.json({ chats });
    }

    return NextResponse.json(
      { error: "Parâmetro chatId, userId ou jobId é obrigatório" },
      { status: 400 }
    );
  } catch (error) {
    console.error('Erro ao buscar chat:', error);
    return NextResponse.json(
      { error: "Erro ao buscar chat" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { chatId, senderId, content } = await request.json();

    // Validações
    if (!chatId || !senderId || !content) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    // Verifica se chat existe
    const chat = await getChatById(chatId);
    if (!chat) {
      return NextResponse.json(
        { error: "Chat não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se usuário existe
    const sender = await getUserById(senderId);
    if (!sender) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Verifica se usuário pertence ao chat
    if (sender.id !== chat.company_id && sender.id !== chat.worker_id) {
      return NextResponse.json(
        { error: "Usuário não pertence ao chat" },
        { status: 403 }
      );
    }

    // Adiciona uma nova mensagem
    const message = await createMessage({
      chat_id: chatId,
      sender_id: senderId,
      content,
      status: 'sent'
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return NextResponse.json(
      { error: "Erro ao enviar mensagem" },
      { status: 500 }
    );
  }
}
