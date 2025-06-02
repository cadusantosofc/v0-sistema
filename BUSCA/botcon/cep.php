<?php

$comando = str_replace("-", "", $comando);

if(is_numeric($comando) && strlen($comando) == 8){
   
function getStr($string, $start, $end) {
	$str = explode($start, $string);
	$str = explode($end, $str[1]);
	return $str[0];
}

$cep = $comando;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL,"https://viacep.com.br/ws/$cep/json");
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$data = curl_exec($ch);
curl_close ($ch);

$cep = getStr($data, '"cep": "', '",');
$logradouro = getStr($data, '"logradouro": "', '",');
$complemento = getStr($data, '"complemento": "', '",');
$bairro = getStr($data, '"bairro": "', '",');
$localidade = getStr($data, '"localidade": "', '",');
$uf = getStr($data, '"uf": "', '",');
$ibge = getStr($data, '"ibge": "', '",');

if($cep == ""){
     
    apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
    apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "🔍 *CONSULTA DE CEP* 🔍

*• CEP NÃO ENCONTRADO!*

🔛 *BY:* @fiotibuscasbot", "reply_to_message_id" => $message_id,
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'apagar']))//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));

} else if($complemento == ""){
	            
    apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
    apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "🔍 *CONSULTA DE CEP* 🔍

*• Cep:*  `$cep`
*• Logradouro:*  `$logradouro`
*• Bairro:*  `$bairro`
*• Cidade:*  `$localidade`
*• Estado:*  `$uf`
*• Ibge:*  `$ibge`

🔛 *BY:* @fiotibuscasbot

🔛 GRUPO OFICIAL: @consultarcpfplus", "reply_to_message_id" => $message_id,
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'apagar']))//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));
                                    
}else{
       
    apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
    apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "🔍 *CONSULTA DE CEP* 🔍

*• Cep:*  `$cep`
*• Logradouro:*  `$logradouro`
*• Complemento:*  `$complemento`
*• Bairro:*  `$bairro`
*• Cidade:*  `$localidade`
*• Estado:*  `$uf`
*• Ibge:*  `$ibge`


🔛 *BOT:* @fiotibuscasbot

🔛 *GRUPO OFICIAL:* @consultarcpfplus", "reply_to_message_id" => $message_id,
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'apagar']))//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));
                                    
}}else{
	
	apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
    apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*CEP Checker* - _Consulta de CEP, obtém informações sobre os logradouros (como nome de rua, avenida, alameda, beco, travessa, praça etc), nome de bairro, cidade e estado onde ele está localizado.

Formato:_
70040010
_ou_
70040-010

`/cep 70040010`", "reply_to_message_id" => $message_id,
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));
}

?>