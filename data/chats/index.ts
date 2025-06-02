import fs from 'fs/promises'
import path from 'path'

const CHATS_DIR = path.join(process.cwd(), 'data/chats')
const CHATS_FILE = path.join(CHATS_DIR, 'chats.txt')
const MESSAGES_FILE = path.join(CHATS_DIR, 'messages.txt')

// Garante que o diretório existe
async function ensureDir() {
  try {
    await fs.mkdir(CHATS_DIR, { recursive: true })
    await fs.access(CHATS_FILE).catch(() => fs.writeFile(CHATS_FILE, ''))
    await fs.access(MESSAGES_FILE).catch(() => fs.writeFile(MESSAGES_FILE, ''))
  } catch (error) {
    console.error('Erro ao criar diretório de chats:', error)
  }
}

// Inicializa o diretório
ensureDir()

export type Message = {
  id: string
  chatId: string
  senderId: string
  senderName: string
  senderRole: 'admin' | 'company' | 'worker'
  content: string
  timestamp: string
}

export type Chat = {
  id: string
  jobId: string
  companyId: string
  workerId: string
  companyName: string
  workerName: string
  jobTitle: string
  status: 'active' | 'closed'
  createdAt: string
  updatedAt: string
}

// Funções auxiliares
async function readChats(): Promise<Chat[]> {
  try {
    const content = await fs.readFile(CHATS_FILE, 'utf-8')
    return content.trim() ? content.split('\n').map(line => JSON.parse(line)) : []
  } catch (error) {
    console.error('Erro ao ler chats:', error)
    return []
  }
}

async function readMessages(): Promise<Message[]> {
  try {
    const content = await fs.readFile(MESSAGES_FILE, 'utf-8')
    return content.trim() ? content.split('\n').map(line => JSON.parse(line)) : []
  } catch (error) {
    console.error('Erro ao ler mensagens:', error)
    return []
  }
}

async function writeChats(chats: Chat[]) {
  try {
    const content = chats.map(chat => JSON.stringify(chat)).join('\n')
    await fs.writeFile(CHATS_FILE, content)
  } catch (error) {
    console.error('Erro ao salvar chats:', error)
  }
}

async function writeMessages(messages: Message[]) {
  try {
    const content = messages.map(message => JSON.stringify(message)).join('\n')
    await fs.writeFile(MESSAGES_FILE, content)
  } catch (error) {
    console.error('Erro ao salvar mensagens:', error)
  }
}

// Funções públicas
export async function createChat(chat: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>): Promise<Chat> {
  const chats = await readChats()
  const newChat: Chat = {
    ...chat,
    id: `chat_${Date.now()}`,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  await writeChats([...chats, newChat])
  return newChat
}

export async function getChat(chatId: string): Promise<Chat | null> {
  const chats = await readChats()
  return chats.find(chat => chat.id === chatId) || null
}

export async function getChatsByUser(userId: string): Promise<Chat[]> {
  const chats = await readChats()
  return chats.filter(chat => chat.workerId === userId || chat.companyId === userId)
}

export async function getChatsByJob(jobId: string): Promise<Chat[]> {
  const chats = await readChats()
  return chats.filter(chat => chat.jobId === jobId)
}

export async function addMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
  const messages = await readMessages()
  const newMessage: Message = {
    ...message,
    id: `msg_${Date.now()}`,
    timestamp: new Date().toISOString()
  }
  
  await writeMessages([...messages, newMessage])

  // Atualiza o timestamp do chat
  const chats = await readChats()
  const chatIndex = chats.findIndex(chat => chat.id === message.chatId)
  if (chatIndex >= 0) {
    chats[chatIndex].updatedAt = new Date().toISOString()
    await writeChats(chats)
  }

  return newMessage
}

export async function getMessages(chatId: string): Promise<Message[]> {
  const messages = await readMessages()
  return messages.filter(message => message.chatId === chatId)
}

export async function closeChat(chatId: string): Promise<boolean> {
  const chats = await readChats()
  const chatIndex = chats.findIndex(chat => chat.id === chatId)
  
  if (chatIndex >= 0) {
    chats[chatIndex].status = 'closed'
    chats[chatIndex].updatedAt = new Date().toISOString()
    await writeChats(chats)
    return true
  }
  
  return false
}
