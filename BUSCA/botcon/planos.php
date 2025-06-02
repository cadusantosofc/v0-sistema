<?php



 if($type == 'private') {

    apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
    apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*● PROMOÇÃO DE SALDOS

COMPRE SALDO AGORA MESMO

━━━━━━━━━━━━━━━━━
● CRÉDITOS E PREÇOS  

• 05 CRÉDITOS = R$ 02,50
• 10 CRÉDITOS = R$ 05,00
• 20 CRÉDITOS = R$ 10,00
• 30 CRÉDITOS = R$ 20,00

• 40 CRÉDITOS = R$ 25,00
• 50 CRÉDITOS = R$ 35,00
• 100 CRÉDITOS = R$ 60,00
• 500 CRÉDITOS = R$ 120,00

━━━━━━━━━━━━━━━━━
● TEMOS VIP PARA GRUPOS

• MENSAL = R$ 60,00
• QUINZENAL = R$ 40,00
• SEMANAL = R$ 20,00

━━━━━━━━━━━━━━━━━

● FORMAS DE PAGAMENTO

• BOLETO
• MERCADO PAGO
• PICPAY
• TRANSFERÊNCIA
• NUBANK
• PAYPAL
• PIX

━━━━━━━━━━━━━━━━━
🔍 OS CRÉDITOS DE CONSULTAS 
SERAM LIBERADOS APÓS O ENVIO
DO COMPROVANTE NO PV.
━━━━━━━━━━━━━━━━━
● PARA COMPRAR CHAME:

🐰 @SRFioTi 🐰

━━━━━━━━━━━━━━━━━
● GRUPO REFERÊNCIAS: @fiotibuscasref

━━━━━━━━━━━━━━━━━
● QUER MAIS CRÉDITOS SÓ CHAMAR!

• TEMOS GRUPO FECHADO DE CLIENTES!*"));

}else{
                
    apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
    apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*● PROMOÇÃO DE SALDOS

COMPRE SALDO AGORA MESMO

━━━━━━━━━━━━━━━━━
● CRÉDITOS E PREÇOS  

• 05 CRÉDITOS = R$ 02,50
• 10 CRÉDITOS = R$ 05,00
• 20 CRÉDITOS = R$ 10,00
• 30 CRÉDITOS = R$ 20,00

• 40 CRÉDITOS = R$ 25,00
• 50 CRÉDITOS = R$ 35,00
• 100 CRÉDITOS = R$ 60,00
• 500 CRÉDITOS = R$ 120,00

━━━━━━━━━━━━━━━━━
● TEMOS VIP PARA GRUPOS

• MENSAL = R$ 60,00
• QUINZENAL = R$ 40,00
• SEMANAL = R$ 20,00

━━━━━━━━━━━━━━━━━

● FORMAS DE PAGAMENTO

• BOLETO
• MERCADO PAGO
• PICPAY
• TRANSFERÊNCIA
• NUBANK
• PAYPAL
• PIX

━━━━━━━━━━━━━━━━━
🔍 OS CRÉDITOS DE CONSULTAS 
SERAM LIBERADOS APÓS O ENVIO
DO COMPROVANTE NO PV.
━━━━━━━━━━━━━━━━━
● PARA COMPRAR CHAME:

🐰 @SRFioTi 🐰

━━━━━━━━━━━━━━━━━
● GRUPO REFERÊNCIAS: @fiotibuscasref

━━━━━━━━━━━━━━━━━
● QUER MAIS CRÉDITOS SÓ CHAMAR!

• TEMOS GRUPO FECHADO DE CLIENTES!*", "reply_to_message_id" => $message_id));

} 

?>