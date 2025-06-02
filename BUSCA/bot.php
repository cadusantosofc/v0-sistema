<?php 
define('BOT_TOKEN', '1652980204:AAGsX_V3Gx-oz3bv4O5Gc5UkSxZdDo5dB40'); 
define('API_URL', 'https://api.telegram.org/bot'.BOT_TOKEN.'/'); 
function apiRequestWebhook($method, $parameters) {
	if (!is_string($method)) {
		error_log("Nome do método deve ser uma string\n"); 
		return false; 
	} 
	if (!$parameters) {
		$parameters = array(); 
	} else if (!is_array($parameters)) {
		error_log("Os parâmetros devem ser um array\n"); 
		return false; 
	} 
	$parameters["method"] = $method; 
	header("Content-Type: application/json"); 
	echo json_encode($parameters); 
	return true; 
} 
function exec_curl_request($handle) {
	$response = curl_exec($handle); 
	if ($response === false) {
		$errno = curl_errno($handle); 
		$error = curl_error($handle); 
		error_log("Curl retornou um erro $errno: $error\n"); 
		curl_close($handle); 
		return false; 
	} 
	$http_code = intval(curl_getinfo($handle, CURLINFO_HTTP_CODE)); 
	curl_close($handle); 
	if ($http_code >= 500) {
		// do not wat to DDOS server if something goes wrong 
		sleep(10); 
		return false; 
	} else if ($http_code != 200) {
		$response = json_decode($response, true); 
		error_log("Request has failed with error {$response['error_code']}: {$response['description']}\n"); 
		if ($http_code == 401) {
			throw new Exception('Invalid access token provided'); 
		} 
		return false; 
	} else {
		$response = json_decode($response, true); 
		if (isset($response['description'])) {
			error_log("Request was successfull: {$response['description']}\n"); 
		} 
		$response = $response['result']; 
	} 
	return $response; 
} 
function apiRequest($method, $parameters) {
	if (!is_string($method)) {
		error_log("Method name must be a string\n"); 
		return false; 
	} 
	if (!$parameters) {
		$parameters = array(); 
	} else if (!is_array($parameters)) {
		error_log("Parameters must be an array\n"); 
		return false; 
	} 
	foreach ($parameters as $key => &$val) {
		// encoding to JSON array parameters, for example reply_markup 
		if (!is_numeric($val) && !is_string($val)) {
			$val = json_encode($val); 
		} 
	} 
	$url = API_URL.$method.'?'.http_build_query($parameters); 
	$handle = curl_init($url); 
	curl_setopt($handle, CURLOPT_RETURNTRANSFER, true); 
	curl_setopt($handle, CURLOPT_CONNECTTIMEOUT, 5); 
	curl_setopt($handle, CURLOPT_TIMEOUT, 60); 
	return exec_curl_request($handle); 
} 
function apiRequestJson($method, $parameters) {
	if (!is_string($method)) {
		error_log("Method name must be a string\n"); 
		return false; 
	} 
	if (!$parameters) {
		$parameters = array(); 
	} else if (!is_array($parameters)) {
		error_log("Parameters must be an array\n"); 
		return false; 
	} 
	$parameters["method"] = $method; 
	$handle = curl_init(API_URL); 
	curl_setopt($handle, CURLOPT_RETURNTRANSFER, true); 
	curl_setopt($handle, CURLOPT_CONNECTTIMEOUT, 5); 
	curl_setopt($handle, CURLOPT_TIMEOUT, 60); 
	curl_setopt($handle, CURLOPT_POSTFIELDS, json_encode($parameters)); 
	curl_setopt($handle, CURLOPT_HTTPHEADER, array("Content-Type: application/json")); 
	return exec_curl_request($handle); 
} 

function processaCallbackQuery($callback){
  $callback_id = $callback['id'];
  $chat_id = $callback['message']['chat']['id'];
  $type = $callback['message']['chat']['type'];
  $message_id = $callback['message']['message_id'];
  $user_id = $callback['from']['id'];
  $user_name = $callback['from']['username']; 
  $name = $callback['from']['first_name'];
  $data =  $callback['data'];
  $data_array=unserialize($data);
 if($data_array['data']=="apagar") {
    if($data_array['id']==$callback['from']['id']) {      
      apiRequest("deleteMessage", array('chat_id' => $chat_id, 'message_id' => $message_id));
      //apiRequest("sendMessage", array('chat_id' => $chat_id, 'disable_web_page_preview' => true, "text" => 'https://github.com/sistematico/spamsentrybot'));               

    } else {
  
      apiRequest("answerCallbackQuery", array('callback_query_id' => $callback_id, 'text' => "Você não tem permissão!"));
    }
  } else if ($data == "apagar") {    
    apiRequest("deleteMessage", array('chat_id' => $chat_id, 'message_id' => $message_id));
   
  } else if ($data == 'consultas') {    
    apiRequest("editMessageText", array('chat_id' => $chat_id, 'message_id' => $message_id, "parse_mode" => "Markdown", "text" => '✅ *CONSULTAS*

🔍 *BIN:* `/bin 498408`
🔍 *CEP:* `/cep 70040010`
🔍 *CPF:* `/cpf 27867260854`
🔍 *CNPJ:* `/cnpj 27865757000102`
🔍 *IP:* `/ip 204.152.203.157`
🔍 *NOME:* `/nome Julio Araujo Rodrigues`
🔍 *TELEFONE:* `/numero 54981428444`
🔍 *PLACA:* `/placa ARX5B45`',
'reply_markup' => array('inline_keyboard' => array(                                                                                                        
                                                      //linha 1
                                                     array(                                                        
                                                         array('text'=>'🔙  Menu  🔙',"callback_data"=>'menu'), //botão 1                     
                                                      )
                                                          
                                            )
                                    )));  
  
    } else if ($data == 'geradores') {
    apiRequest("editMessageText", array('chat_id' => $chat_id, 'message_id' => $message_id, "parse_mode" => "Markdown", "text" => '⚙ *GERADORES*

*[+] Gerador de CPF:* /gerarcpf',
'reply_markup' => array('inline_keyboard' => array(                                                                                                        
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🔙  Menu  🔙',"callback_data"=>'menu'), //botão 1                                                   
                                                      )
                                                          
                                            )
                                    )));
    
    } else if ($data == 'menu') {
       if($type == 'private') {
      
      apiRequest("editMessageText", array('chat_id' => $chat_id, 'message_id' => $message_id, "parse_mode" => "Markdown", "text" => '✅ *MENU DE COMANDOS*

*Escolha uma das opções a baixo e clique no botão correspondente.*',
		    'reply_markup' => array('inline_keyboard' => array(
                                                     //linha 1
                                                     array(                                                                                                               
                                                         array('text'=>'🔍 Consultas 🔍',"callback_data"=>'consultas')//botão com callback
                                                      ),
                                                     //linha 2
                                                     array(                                                         
                                                         array('text'=>'🔄 Geradores 🔄',"callback_data"=>'geradores')//botão 2
                                                      ),
                                                     //linha 3
                                                     array(                                                         
                                                         array('text'=>'💵 Adicionar saldo 💵',"callback_data"=>'recarregar'),//botão 3 
                                                      )

                                            )
                                    )));

       } else {
           
           apiRequest("editMessageText", array('chat_id' => $chat_id, 'message_id' => $message_id, "parse_mode" => "Markdown", "text" => '✅ *MENU DE COMANDOS*

*Escolha uma das opções a baixo e clique no botão correspondente.*',
		    'reply_markup' => array('inline_keyboard' => array(
                                                     //linha 1
                                                     array(                                                                                                               
                                                         array('text'=>'🔍 Consultas 🔍',"callback_data"=>'consultas')//botão com callback
                                                      ),
                                                     //linha 2
                                                     array(                                                         
                                                         array('text'=>'🔄 Geradores 🔄',"callback_data"=>'geradores')//botão 2
                                                      ),
                                                     //linha 3
                                                     array(                                                         
                                                         array('text'=>'💵 Adicionar saldo 💵',"callback_data"=>'recarregar'),//botão 3 
                                                      )                                                   

                                            )
                                    )));

       }


    } else if ($data == 'recarregar') {
    apiRequest("editMessageText", array('chat_id' => $chat_id, 'message_id' => $message_id, "parse_mode" => "Markdown", "text" => "
*$name SALDO E SEUS VALORES*
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

• TEMOS GRUPO FECHADO DE CLIENTES!",
'reply_markup' => array('inline_keyboard' => array(                                                                                                        
                                                      //linha 1
                                                     array(
                                                         array('text'=>'CONTATAR VENDEDOR','url'=>'https://t.me/srfioti'), //botão 1                                                   
                                                      ),

                                                      
                                                          
                                            )
                                    )));


  } else if ($data_array['data']=="cpfgen10") {
    if($data_array['id']==$callback['from']['id']) {
         apiRequest("answerCallbackQuery", array('callback_query_id' => $callback_id, 'text' => "Gerando..."));
         for ($i=0; $i < 10; $i++) { 
                
               $ch = curl_init();

               curl_setopt($ch, CURLOPT_URL,"https://www.4devs.com.br/ferramentas_online.php");
               curl_setopt($ch, CURLOPT_POST, 1);
               curl_setopt($ch, CURLOPT_POSTFIELDS,"acao=gerar_cpf&pontuacao=S&cpf_estado=");
               curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

               $cpfgen = curl_exec($ch);

               curl_close ($ch);

               $unidade = "*CPF:*  `".$cpfgen."`";

               $titulos = $titulos."\n".$unidade;                

           }            

           if($cpfgen == ""){

           apiRequest("editMessageText", array('chat_id' => $chat_id, 'message_id' => $message_id, "parse_mode" => "Markdown", "text" => "⚙   *GERADOR DE CPF*   ⚙

*• NÃO FOI POSSÍVEL GERAR!*

🔛 *BY:* @SRFioTi",
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                                                                         
                                                     //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'apagar']))//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));

           }else{

           apiRequest("editMessageText", array('chat_id' => $chat_id, 'message_id' => $message_id, "parse_mode" => "Markdown", "text" => "*Quantidade: 10* 
" . $titulos,
           'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                       //linha 1
                                                         array(
                                                             array('text'=>' 10 ',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'cpfgen10'])), //botão 1                                                                                                                  
                                                             array('text'=>' 30 ',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'cpfgen30'])), //botão 2
                                                             array('text'=>' 50 ',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'cpfgen50'])) //botão 3                                                                                                                                                                       
                                                          ),
                                                          //linha 2
                                                         array(
                                                             array('text'=>'🔁  Atualizar  🔁',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'cpfgen10']))//botão com callback                                                   
                                                          ),                                                          
                                                           //linha 3
                                                         array(
                                                             array('text'=>'🚮  Apagar  🚮',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'apagar']))//botão com callback                                                                                                      
                                                         )
                                                          
                                            )
                                    )));

          }
      } else {
  
      apiRequest("answerCallbackQuery", array('callback_query_id' => $callback_id, 'text' => "Você não tem permissão!"));

    }
  } else if ($data_array['data']=="cpfgen30") {
    if($data_array['id']==$callback['from']['id']) {
         apiRequest("answerCallbackQuery", array('callback_query_id' => $callback_id, 'text' => "Gerando..."));
         for ($i=0; $i < 30; $i++) { 
                
               $ch = curl_init();

               curl_setopt($ch, CURLOPT_URL,"https://www.4devs.com.br/ferramentas_online.php");
               curl_setopt($ch, CURLOPT_POST, 1);
               curl_setopt($ch, CURLOPT_POSTFIELDS,"acao=gerar_cpf&pontuacao=S&cpf_estado=");
               curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

               $cpfgen = curl_exec($ch);

               curl_close ($ch);

               $unidade = "*CPF:*  `".$cpfgen."`";

               $titulos = $titulos."\n".$unidade;                

           }            

           if($cpfgen == ""){

           apiRequest("editMessageText", array('chat_id' => $chat_id, 'message_id' => $message_id, "parse_mode" => "Markdown", "text" => "⚙   *GERADOR DE CPF*   ⚙

*• NÃO FOI POSSÍVEL GERAR!*

🔛 *BY:* @SRFioTi",
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                                                                         
                                                     //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'apagar']))//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));

           }else{
        
           apiRequest("editMessageText", array('chat_id' => $chat_id, 'message_id' => $message_id, "parse_mode" => "Markdown", "text" => "*Quantidade: 30* 
" . $titulos,
           'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                       //linha 1
                                                         array(
                                                             array('text'=>' 10 ',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'cpfgen10'])), //botão 1                                                                                                                  
                                                             array('text'=>' 30 ',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'cpfgen30'])), //botão 2
                                                             array('text'=>' 50 ',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'cpfgen50'])) //botão 3                                                                                                                                                                      
                                                          ),
                                                          //linha 2
                                                         array(
                                                             array('text'=>'🔁  Atualizar  🔁',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'cpfgen30']))//botão com callback                                                   
                                                          ),                                                          
                                                           //linha 3
                                                         array(
                                                             array('text'=>'🚮  Apagar  🚮',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'apagar']))//botão com callback                                                                                                      
                                                         )
                                                          
                                            )
                                    )));
          
          }
      } else {
  
      apiRequest("answerCallbackQuery", array('callback_query_id' => $callback_id, 'text' => "Você não tem permissão!"));

    }
  } else if ($data_array['data']=="cpfgen50") {    
    if($data_array['id']==$callback['from']['id']) {
         apiRequest("answerCallbackQuery", array('callback_query_id' => $callback_id, 'text' => "Gerando..."));
         for ($i=0; $i < 50; $i++) { 
                
               $ch = curl_init();

               curl_setopt($ch, CURLOPT_URL,"https://www.4devs.com.br/ferramentas_online.php");
               curl_setopt($ch, CURLOPT_POST, 1);
               curl_setopt($ch, CURLOPT_POSTFIELDS,"acao=gerar_cpf&pontuacao=S&cpf_estado=");
               curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

               $cpfgen = curl_exec($ch);

               curl_close ($ch);

               $unidade = "*CPF:*  `".$cpfgen."`";

               $titulos = $titulos."\n".$unidade;                

           }            

           if($cpfgen == ""){

           apiRequest("editMessageText", array('chat_id' => $chat_id, 'message_id' => $message_id, "parse_mode" => "Markdown", "text" => "⚙   *GERADOR DE CPF*   ⚙

*• NÃO FOI POSSÍVEL GERAR!*

🔛 *BY:* @SRFioTi",
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                                                                         
                                                     //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'apagar']))//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));

           }else{
           
           apiRequest("editMessageText", array('chat_id' => $chat_id, 'message_id' => $message_id, "parse_mode" => "Markdown", "text" => "*Quantidade: 50* 
" . $titulos,
           'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                       //linha 1
                                                         array(
                                                             array('text'=>' 10 ',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'cpfgen10'])), //botão 1                                                                                                                  
                                                             array('text'=>' 30 ',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'cpfgen30'])), //botão 2
                                                             array('text'=>' 50 ',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'cpfgen50'])) //botão 3                                                                                                                                                                       
                                                          ),
                                                          //linha 2
                                                         array(
                                                             array('text'=>'🔁  Atualizar  🔁',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'cpfgen50']))//botão com callback                                                   
                                                          ),                                                          
                                                           //linha 3
                                                         array(
                                                             array('text'=>'🚮  Apagar  🚮',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'apagar']))//botão com callback                                                                                                      
                                                         )
                                                          
                                            )
                                    )));    

           }
       } else {
  
      apiRequest("answerCallbackQuery", array('callback_query_id' => $callback_id, 'text' => "Você não tem permissão!"));

     }
  }
  apiRequest("answerCallbackQuery", array('callback_query_id' => $callback_id));
}


function processMessage($message) {
	// process incoming message 
	$message_id = $message['message_id'];
    $chat_id = $message['chat']['id'];
    $type = $message['chat']['type'];
    $titulo = $message['chat']['title'];
    $user_id = $message['from']['id'];
    $first_name = $message['from']['first_name'];
	$last_name = $message['from']['last_name'];
    $username = $message['from']['username'];
    $is_bot = $message['new_chat_participant']['is_bot'];
    $member_name = $message['new_chat_participant']['first_name'];
	$member_last_name = $message['new_chat_participant']['last_name'];
    $member_user = $message['new_chat_participant']['username'];
    $reply_to_message_user_id = $message['reply_to_message']['from']['id'];
    $reply_to_message_name = $message['reply_to_message']['from']['first_name'];
    $reply_to_message_last_name = $message['reply_to_message']['from']['last_name'];
    $reply_to_message_user = $message['reply_to_message']['from']['username'];
    $reply_to_message_id = $message['reply_to_message']['message_id'];
    $forward_from_id = $message['reply_to_message']['forward_from']['id'];
    $forward_from_name = $message['reply_to_message']['forward_from']['first_name'];
    $forward_from_last_name = $message['reply_to_message']['forward_from']['last_name'];
    $forward_from_user = $message['reply_to_message']['forward_from']['username'];
    $adm = "1745478994";
    $adm2 = "1873952885";

    date_default_timezone_set('America/Recife');
    $diasemana = array('Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sabado');
    $data = date('Y/m/d');
    $diasemana_numero = date('w', strtotime($data));
    $dataCerta = date('d/m/y');
    $hora = date('H:i:s');

    if (isset($message['text'])) {
        $text = $message['text']; 
		$member_name = $message['from']['first_name'];
		
  
$verifica = substr(strtoupper($text), 0,4) == '/BIN';

        if($verifica){
            $login = substr($text, 5);
            $login = str_replace("MosquitoBaleadoBOT", "", $login);
            if($login){
               $split = explode(" ", $login);               
               $comando = $split[0];

               include("botcon/bin.php");
               unset($comando);

            }else{
                
                    apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                    apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => '*BIN Checker* - _Consulta de BIN, obtém os detalhes do emissor, como qual banco ou instituição financeira emitiu o cartão e onde ele está localizado, qual a bandeira, o tipo e a categoria do cartão.

Formato:_
498408

`/bin 498408`', "reply_to_message_id" => $message_id,
     'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));
                                    
               
           }
        }


$verifica = substr(strtoupper($text), 0,4) == '/CEP';

        if($verifica){
            $login = substr($text, 5);
            $login = str_replace("MosquitoBaleadoBOT", "", $login);
            if($login){
               $split = explode(" ", $login);               
               $comando = $split[0];

               include("botcon/cep.php");

            }else{
                
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
        }


$verifica = substr(strtoupper($text), 0,4) == '/CPF';
    
        if($verifica){
            $login = substr($text, 5);
            if($login){
               $split = explode(" ", $login);               
               $comando = $split[0];

               include("botcon/cpf.php");

            }else{
                
                    apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                    apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => '*CPF Checker* - _Consulta completa de CPF, obtém dados do portador.

Formato:_
08385265783
_ou_
083.852.657-83

`/cpf 08385265783`', "reply_to_message_id" => $message_id,
   'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                         
                                                      )
                                                          
                                            )
                                    )));
           
               
            }
        }
  
  
$verifica = substr(strtoupper($text), 0,5) == '/CNPJ';
    
        if($verifica){
            $login = substr($text, 6);
            $login = str_replace("MosquitoBaleadoBOT", "", $login);
            if($login){
               $split = explode(" ", $login);
               $split2 = $split[0];
               $split3 = $split[1];
               $comando = $split2;

               include("botcon/cnpj.php");

            }else{
                
               apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
               apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*CNPJ Checker* - _Consulta completa de CNPJ, obtém todos os dados da empresa e nome do(s) proprietário(s) e sócio(s).

Formato:_
27865757000102
_ou_
27.865.757/0001-02

`/cnpj 27865757000102`", "reply_to_message_id" => $message_id,
   'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                         
                                                      )
                                                          
                                            )
                                    )));
           
               
            }
        }
  
  
$verifica = substr(strtoupper($text), 0,6) == '/PLACA';
    
        if($verifica){
            $login = substr($text, 7);
            if($login){
               $split = explode(" ", $login);
               $comando = $split[0];

               include("botcon/placa.php");

            }else{
                
               apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
               apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*PLACA Checker* - _Consulta completa de PLACA, obtém todos os dados da empresa e nome do(s) proprietário do veículo.

Formato:_
ARX5B45
_ou_
ARX-5B45

`/placa ARX5B45`", "reply_to_message_id" => $message_id,
   'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                         
                                                      )
                                                          
                                            )
                                    )));
           
               
            }
        }

  
  
$verifica = substr(strtoupper($text), 0,5) == '/NOME';
    
        if($verifica){
            $login = substr($text, 6);
            $login = str_replace("MosquitoBaleadoBOT", "", $login);
            if($login){                              
               $comando = $login;

               if(stripos($text, "@SRFioTiBOT") == false) {
                   include("botcon/nome.php");
               }

            }else{
                
                apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*NOME Checker* - _Consulta completa de NOME, obtém dados do portador.

Formato:_
JULIO ARAUJO RODRIGUES
_ou_
Julio Araujo Rodrigues

`/nome Julio Araujo Rodrigues`", "reply_to_message_id" => $message_id,
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));
           
               
            }
        }
 

$verifica = substr(strtoupper($text), 0,7) == '/NUMERO';
    
        if($verifica){
            $login = substr($text, 8);
            if($login){
               $split = explode(" ", $login);
               $comando = $split[0];

               include("botcon/telefone.php");

            }else{
                
               apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
               apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*TELEFONE Checker* - _Consulta completa de Número de Telefone, obtém todos os dados do dono.

Formato:_
54981428444

`/numero 54981428444`", "reply_to_message_id" => $message_id,
   'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                         
                                                      )
                                                          
                                            )
                                    )));
           
               
            }
        }


$verifica = substr(strtoupper($text), 0,3) == '/IP';

        if($verifica){
            $login = substr($text, 4);
            $login = str_replace("MosquitoBaleadoBOT", "", $login);
            if($login){
               $split = explode(" ", $login);               
               $comando = $split[0];

               include("botcon/ip.php");

            }else{
                
                    apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                    apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*IP Checker* - _Consulta o número de IP, obtém dados do número de IP, como qual é o provedor, ip reverso e país, estado, cidade e as coordenadas de onde ele está localizado.

Formato:_
204.152.203.157

`/ip 204.152.203.157`", "reply_to_message_id" => $message_id,
   'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));
                                    
               
            }
        }
        

       if(strpos($text, "/planos") === 0) {
            
           include("botcon/planos.php");

       }


$verifica = substr(strtoupper($text), 0,4) == '/ADC';

        if($verifica){
            $login = substr($text, 5);
            if($login){
               $split = explode(" ", $login);               
               $comando = $split[0];
               
               $id_creditos = explode("|", $comando);

               $id = $id_creditos[0];
               $creditos = $id_creditos[1];
              
               if ($user_id == $adm || $user_id == $adm2) {
                   
                   $array_usuarios = file("botcon/usuarios.txt");
                   $total_usuarios_registrados = count($array_usuarios);
                  
                   $continuar = false;
                   for($i=0;$i<count($array_usuarios);$i++){
                       $explode = explode("|" , $array_usuarios[$i]);
                       if($id == $explode[0]){         
                           $creditos_list = $explode[1];
                           $continuar = true;
                        }
                    }

                    if($continuar){
                       apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                       apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "🚫 *O usuário já está na lista VIP*

━━━━━━━━━━━━━━━━━
ID de Usuário  |  Créditos Atuais
━━━━━━━━━━━━━━━━━
ID:".$id." | ".$creditos_list,
     'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));

                   } else {
	                   if($file = fopen("botcon/usuarios.txt","a+")) {
                           fputs($file, $id."|".$creditos."\n");                     
                           apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                           apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "✅ *Usuário incluido na lista VIP*

━━━━━━━━━━━━━━━━━
ID de Usuário  |  Créditos Adicionados
━━━━━━━━━━━━━━━━━
ID:".$id." | ".$creditos,
     'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));
 
                      }
                  }
               }
           }
        }


$verifica = substr(strtoupper($text), 0,3) == '/RM';

        if($verifica){
            $login = substr($text, 4);
            if($login){
               $split = explode(" ", $login);               
               $comando = $split[0];

               $id_creditos = explode("|", $comando);

               $id = $id_creditos[0];
               $creditos = $id_creditos[1];

               if ($user_id == $adm || $user_id == $adm2) {

                   $array_usuarios = file("botcon/usuarios.txt");
                   $total_usuarios_registrados = count($array_usuarios);
                   
                   $continuar = false;
                   for($i=0;$i<count($array_usuarios);$i++){
                       $explode = explode("|" , $array_usuarios[$i]);
                       if($id == $explode[0]){         
                           $continuar = true;
                        }
                    }

                   if(!$continuar){
                       apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                       apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "🚫 *O usuário não está na lista VIP*

━━━━━━━━━━━━━━━━━
ID de Usuário  |  Data da Pesquisa
━━━━━━━━━━━━━━━━━
ID:".$id."|".$dataCerta." ".$hora,
     'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));

                   } else {

                  $arquivo = file_get_contents('botcon/usuarios.txt');
                  $linhas = explode("\n", $arquivo);
                  $palavra = $id;
                  foreach($linhas as $linha => $valor) {
                      $posicao = preg_match("/\b$palavra\b/i", $valor);                      
                      if($posicao) {
                          unset($linhas[$linha]);
                          apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                          apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "✅ *Usuário excluido da lista VIP*

━━━━━━━━━━━━━━━━━
ID de Usuário  |  Data da Exclusão
━━━━━━━━━━━━━━━━━
ID:".$id."|".$dataCerta." ".$hora,
     'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));
                  
                      }
                  }
                  $arquivo = implode("\n", $linhas);
                  file_put_contents('botcon/usuarios.txt', $arquivo);                    
                
                  }
               }
           }
        }


$verifica = substr(strtoupper($text), 0,9) == '/GRUPOVIP';

        if($verifica){
            $login = substr($text, 10);
            if($login){
               $split = explode(" ", $login);               
               $comando = $split[0];
               $hora_marcada = $split[1];

               if($hora_marcada == ""){

                   $hora_marcada = $hora;

               }

               $id_data = explode("|", $comando);
          
               $dt = explode("/", $id_data[1]);
               $dia = $dt[0];
               $mes = $dt[1];
               $ano = $dt[2];

               if ($user_id == $adm || $user_id == $adm2) {
                   
                   $array_grupos = file("botcon/grupos.txt");
                   $total_grupos_registrados = count($array_grupos);
                   $adc_id = explode("|" , $comando);
                   $adc_id[0] = str_replace("-", "", $adc_id[0]);

                   $continuar = false;
                   for($i=0;$i<count($array_grupos);$i++){
                       $explode = explode("|" , $array_grupos[$i]);
                       if($adc_id[0] == $explode[0]){         
                           $dt_lista = $explode[1];
                           $continuar = true;
                        }
                    }

                    $dt_hora = explode(" ", $dt_lista);

                    $converte_dt = explode("/", $dt_hora[0]);
                    $c_ano = $converte_dt[0];
                    $c_mes = $converte_dt[1];
                    $c_dia = $converte_dt[2];

                    if($continuar){
                       apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                       apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "🚫 *O grupo já está na lista VIP*

━━━━━━━━━━━━━━━━━
Chat-id do Grupo|Data de Vencimento
━━━━━━━━━━━━━━━━━
Chat-id: -".$adc_id[0]."|".$c_dia."/".$c_mes."/".$c_ano." ".$dt_hora[1],
     'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));

                   } else {
	                   if($file = fopen("botcon/grupos.txt","a+")) {
                           fputs($file, "\n".$adc_id[0]."|".$ano."/".$mes."/".$dia." ".$hora_marcada);                     
                           apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                           apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "✅ *Grupo incluido na lista VIP*

━━━━━━━━━━━━━━━━━
Chat-id do Grupo|Data de Vencimento
━━━━━━━━━━━━━━━━━
Chat-id: -".$adc_id[0]."|".$id_data[1]." ".$hora_marcada,
     'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));
 
                      }
                  }
               }
           }
        }


$verifica = substr(strtoupper($text), 0,8) == '/EXCLUIR';

        if($verifica){
            $login = substr($text, 9);
            if($login){
               $split = explode(" ", $login);               
               $comando = $split[0];
            
               if ($user_id == $adm || $user_id == $adm2) {

                   $array_grupos = file("botcon/grupos.txt");
                   $total_grupos_registrados = count($array_grupos);                  
                   $comando = str_replace("-", "", $comando);
                  
                   $continuar = false;
                   for($i=0;$i<count($array_grupos);$i++){
                       $explode = explode("|" , $array_grupos[$i]);
                       if($comando == $explode[0]){                                    
                           $continuar = true;
                        }
                    }

                   if(!$continuar){
                       apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                       apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "🚫 *O grupo não está na lista VIP*

━━━━━━━━━━━━━━━━━
Chat-id do Grupo  |  Data da Pesquisa
━━━━━━━━━━━━━━━━━
Chat-id: -".$comando."|".$dataCerta." ".$hora,
     'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));

                   } else {

                  $arquivo = file_get_contents('botcon/grupos.txt');
                  $linhas = explode("\n", $arquivo);
                  $palavra = $comando;
                  foreach($linhas as $linha => $valor) {
                      $posicao = preg_match("/\b$palavra\b/i", $valor);                      
                      if($posicao) {
                          unset($linhas[$linha]);
                          apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                          apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "✅ *Grupo excluido da lista VIP*

━━━━━━━━━━━━━━━━━
Chat-id do Grupo  |  Data da Exclusão
━━━━━━━━━━━━━━━━━
Chat-id: -".$comando."|".$dataCerta." ".$hora,
     'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));
                  
                      }
                  }
                  $arquivo = implode("\n", $linhas);
                  file_put_contents('botcon/grupos.txt', $arquivo);                    
                
                  }
               }
           }
        }


$verifica = substr(strtoupper($text), 0,8) == '/USERBAN';

        if($verifica){
            $login = substr($text, 9);
            if($login){
               $split = explode(" ", $login);               
               $comando = $split[0];
               
               $id_data_ban = explode("|", $comando);
               $id = $id_data_ban[0];
                             
               if ($user_id == $adm || $user_id == $adm2) {
                   
                   $array_usuarios_ban = file("botcon/userban.txt");
                   $total_usuarios_ban_registrados = count($array_usuarios_ban);
                  
                   $continuar = false;
                   for($i=0;$i<count($array_usuarios_ban);$i++){
                       $explode = explode("|" , $array_usuarios_ban[$i]);
                       if($id == $explode[0]){         
                           $data_ban = $explode[1];
                           $continuar = true;
                        }
                    }

                    if($continuar){
                       apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                       apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "🚫 *O usuário já está banido*

━━━━━━━━━━━━━━━━━
ID de Usuário  | Data do Banimento
━━━━━━━━━━━━━━━━━
ID:".$id." | ".$data_ban,
     'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));

                   } else {
	                   if($file = fopen("botcon/userban.txt","a+")) {
                           fputs($file, $id."|".$dataCerta." ".$hora."\n");                     
                           apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                           apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "✅ *Usuário banido*

━━━━━━━━━━━━━━━━━
ID de Usuário  |  Data do Banimento
━━━━━━━━━━━━━━━━━
ID:".$id." | ".$dataCerta." ".$hora,
     'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));
 
                      }
                  }
               }
           }
        }


$verifica = substr(strtoupper($text), 0,7) == '/DESBAN';

        if($verifica){
            $login = substr($text, 8);
            if($login){
               $split = explode(" ", $login);               
               $comando = $split[0];
               
               $id_data_ban = explode("|", $comando);
               $id = $id_data_ban[0];

               if ($user_id == $adm || $user_id == $adm2) {

                   $array_usuarios_ban = file("botcon/userban.txt");
                   $total_usuarios_ban_registrados = count($array_usuarios_ban);
                   
                   $continuar = false;
                   for($i=0;$i<count($array_usuarios_ban);$i++){
                       $explode = explode("|" , $array_usuarios_ban[$i]);
                       if($id == $explode[0]){         
                           $continuar = true;
                        }
                    }

                   if(!$continuar){
                       apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                       apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "🚫 *O usuário não está banido*

━━━━━━━━━━━━━━━━━
ID de Usuário  |  Data da Pesquisa
━━━━━━━━━━━━━━━━━
ID:".$id." | ".$dataCerta." ".$hora,
     'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));

                   } else {

                  $arquivo = file_get_contents('botcon/userban.txt');
                  $linhas = explode("\n", $arquivo);
                  $palavra = $id;
                  foreach($linhas as $linha => $valor) {
                      $posicao = preg_match("/\b$palavra\b/i", $valor);                      
                      if($posicao) {
                          unset($linhas[$linha]);
                          apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                          apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "✅ *Usuário desbanido*

━━━━━━━━━━━━━━━━━
ID de Usuário  |  Data do Desban
━━━━━━━━━━━━━━━━━
ID:".$id." | ".$dataCerta." ".$hora,
     'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));
                  
                      }
                  }
                  $arquivo = implode("\n", $linhas);
                  file_put_contents('botcon/userban.txt', $arquivo);                    
                
                  }
               }
           }
        }


        if(strpos($text, "/saldo") === 0) {
            
                   $array_usuarios = file("botcon/usuarios.txt");
                   $total_usuarios_registrados = count($array_usuarios);
                  
                   $continuar = false;
                   for($i=0;$i<count($array_usuarios);$i++){
                       $explode = explode("|" , $array_usuarios[$i]);
                       if($user_id == $explode[0]){         
                           $creditos_list = $explode[1];
                           $continuar = true;
                        }
                    }

                    if($continuar && $creditos_list > 0){
                        
                           apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                           apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "✅ *Saldo Disponivel*
━━━━━━━━━━━━━━━━━
Nome: ".$first_name."
━━━━━━━━━━━━━━━━━
ID: ".$user_id."
━━━━━━━━━━━━━━━━━
Créditos Disponivel: ".$creditos_list, "reply_to_message_id" => $message_id,
     'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'apagar']))//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));

                        
                   }else{
                       $creditos_list = 0;
                      
                           apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                           apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "🚫 *Você não tem Saldo Disponivel*
━━━━━━━━━━━━━━━━━
Nome: ".$first_name."
━━━━━━━━━━━━━━━━━
ID: ".$user_id."
━━━━━━━━━━━━━━━━━
Créditos Disponivel: ".$creditos_list, "reply_to_message_id" => $message_id,
     'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'apagar']))//botão com callback                                                  
                                                      )
                                                          
                                            )
                                    )));

                       
                  }
             }


         if (strpos($text, "/gerarcpf") !== false) {      
             if($type == 'private') {
              apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
              apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => '*Escolha a quantidade:*',    
		    'reply_markup' => array('inline_keyboard' => array(
                                                         //linha 1
                                                         array(
                                                             array('text'=>' 10 ',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'cpfgen10'])), //botão 1                                                                                                                  
                                                             array('text'=>' 30 ',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'cpfgen30'])), //botão 2
                                                             array('text'=>' 50 ',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'cpfgen50'])) //botão 3                                                                                                                                                                   
                                                          ),
                                                          //linha 2
                                                         array(
                                                             array('text'=>'🔙  Menu  🔙',"callback_data"=>'menu')//botão com callback                                                   
                                                          )
                                            )
                                    )));
            
            
            
             } else {
                  apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                  apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => '*Escolha a quantidade:*', 'reply_to_message_id' => $message_id,    
		    'reply_markup' => array('inline_keyboard' => array(
                                                         //linha 1
                                                         array(
                                                             array('text'=>' 10 ',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'cpfgen10'])), //botão 1                                                                                                                  
                                                             array('text'=>' 30 ',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'cpfgen30'])), //botão 2
                                                             array('text'=>' 50 ',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'cpfgen50'])) //botão 3                                                                                                                                                                   
                                                          ),
                                                          //linha 2
                                                         array(
                                                             array('text'=>'🔙  Menu  🔙',"callback_data"=>'menu')//botão com callback                                                   
                                                          )
                                            )
                                    )));
            
            
            
             }
        }


      if (strpos($text, "/recarregar") !== false) {

           apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
           apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "
*$first_name SALDO E SEUS VALORES*
*━━━━━━━━━━━━━━━━━
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

• TEMOS GRUPO FECHADO DE CLIENTES!*",
'reply_markup' => array('inline_keyboard' => array(                                                                                                        
                                                      //linha 1
                                                     array(
                                                         array('text'=>'CONTATAR VENDEDOR','url'=>'https://t.me/srfioti'), //botão 1                                                   
                                                      ),
                                                      //linha 2
                                                      
                                                          
                                            )
                                    )));            

      }
     

       switch ($text) {    
        case '/id': 

            if($type == 'private') {

                if ($username != "") {
                    apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                    apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*INFORMAÇÕES DO USUÁRIO:

ID:* `".$user_id."`
*Nome: *`".$first_name." ".$last_name."`
*Username: *`@".$username."`", "reply_to_message_id" => $message_id));          
                } else {
                	apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                    apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*INFORMAÇÕES DO USUÁRIO:

ID:* `".$user_id."`
*Nome: *`".$first_name." ".$last_name."`", "reply_to_message_id" => $message_id));          
                }

           } else {

                if ($username != "") {
                    apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                    apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*INFORMAÇÕES DO GRUPO:

Chat ID:* `".$chat_id."`
*Titulo:* `".$titulo."`

*INFORMAÇÕES DO USUÁRIO:*

*ID:* `".$user_id."`
*Nome: *`".$first_name." ".$last_name."`
*Username: *`@".$username."`", "reply_to_message_id" => $message_id));          
                } else {
                	apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
                    apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*INFORMAÇÕES DO GRUPO:

Chat ID:* `".$chat_id."`
*Titulo:* `".$titulo."`

*INFORMAÇÕES DO USUÁRIO:*

*ID:* `".$user_id."`
*Nome: *`".$first_name." ".$last_name."`", "reply_to_message_id" => $message_id));          
                }

           }

           break;
     
       }


        if (strpos($text, "/menu") === 0) {
           
            apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
            apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => '✅ *MENU DE COMANDOS*

*Escolha uma das opções a baixo e clique no botão correspondente.*', "reply_to_message_id" => $message_id,
		    'reply_markup' => array('inline_keyboard' => array(
                                                    //linha 1
                                                     array(                                                                                                               
                                                         array('text'=>'🔍 Consultas 🔍',"callback_data"=>'consultas')//botão com callback
                                                      ),
                                                     //linha 2
                                                     array(                                                         
                                                         array('text'=>'🔄 Geradores 🔄',"callback_data"=>'geradores')//botão 2
                                                      ),
                                                     //linha 3
                                                     array(                                                         
                                                         array('text'=>'💵 Adicionar saldo 💵',"callback_data"=>'recarregar'),//botão 3 
                                                      )
                                                                                                                
                                            )
                                    )));
            
        }

        $butons = array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => '*Olá, *'. $message['from']['first_name'].
		'! *Meu nome é FIOTI BUSCAS BOT. Para fazer uma consulta, basta clicar no botão a baixo.*', "reply_to_message_id" => $message_id,
		'reply_markup' => array('inline_keyboard' => array(
                                                     //linha 1
                                                     array(                                                                                                               
                                                         array('text'=>'🔍 Consultas 🔍',"callback_data"=>'consultas')//botão com callback
                                                      ),
                                                     //linha 2
                                                     array(                                                         
                                                         array('text'=>'🔄 Geradores 🔄',"callback_data"=>'geradores')//botão 2
                                                      ),
                                                     //linha 3
                                                     array(                                                         
                                                         array('text'=>'💵 Adicionar saldo 💵',"callback_data"=>'recarregar'),//botão 3 
                                                      )

                                      )));


        if (strpos($text, "/start") === 0) {
			$type = $message['chat']['type'];
			
				apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
				apiRequest("sendMessage", $butons
                             );
		           
		}    
    }
} 



define('WEBHOOK_URL', 'https://fiotissh.xyz/FIOTI-BUSCAS/bot.php');
if (php_sapi_name() == 'cli') {
  // if run from console, set or delete webhook
  apiRequest('setWebhook', array('url' => isset($argv[1]) && $argv[1] == 'delete' ? '' : WEBHOOK_URL));
  exit;
}

$content = file_get_contents("php://input");
$update = json_decode($content, true);
if (!$update) {
  exit;
} else if (isset($update["message"])) {
  processMessage($update["message"]);
} else if (isset($update["callback_query"])) {
  processaCallbackQuery($update["callback_query"]);
}

?>