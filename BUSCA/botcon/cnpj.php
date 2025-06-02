<?php 

error_reporting(0);
set_time_limit(0);

date_default_timezone_set('America/Recife');
$dt_atual = date("Y/m/d H:i:s");
$timestamp_dt_atual = strtotime($dt_atual);

$adm = "324297677";

$array_usuarios = file("botcon/usuarios.txt");
$total_usuarios_registrados = count($array_usuarios);

$array_grupos = file("botcon/grupos.txt");
$total_grupos_registrados = count($array_grupos);

$array_usuarios_ban = file("botcon/userban.txt");
$total_usuarios_ban_registrados = count($array_usuarios_ban);

$continuar = false;
for($i=0;$i<count($array_usuarios);$i++){
    $explode = explode("|" , $array_usuarios[$i]);
     if($user_id == $adm || $user_id == $explode[0]){
         $creditos_list = $explode[1];
         $continuar = true;
     }
}

$continuar2 = false;
for($i=0;$i<count($array_grupos);$i++){
    $grupo_vip = explode("|" , $array_grupos[$i]);
     if($user_id == $adm || $chat_id == "-$grupo_vip[0]"){
         $vencimento = $grupo_vip[1];
         $continuar2 = true;
     }
}

$timestamp_dt_expira = strtotime($vencimento);

$continuar3 = false;
for($i=0;$i<count($array_usuarios_ban);$i++){
    $explode2 = explode("|" , $array_usuarios_ban[$i]);
    if($user_id != $adm && $user_id == $explode2[0]){
        $continuar3 = true;
     }
 }

if(!$continuar && !$continuar2){
    apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*Você não tem permissão para utilizar esse comando! Para se tornar um usuário VIP e ter acesso as consutas e os checkers, entre em contato com o meu desenvolvedor e contrate um plano.

Para mais informações ou para contratar, digite:* /planos", "reply_to_message_id" => $message_id)); 
} else if($user_id == $adm || $timestamp_dt_atual < $timestamp_dt_expira || $creditos_list > 0){

if($continuar3){
    apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*🚫 VOCÊ ESTÁ BANIDO PERMANENTE! 🚫*", "reply_to_message_id" => $message_id)); 
} else if($user_id == $adm || !$continuar3) {

$comando = str_replace(".", "", $comando);
$comando = str_replace("/", "", $comando);
$comando = str_replace("-", "", $comando);

if(strlen($comando) == 14){

$cnpj = $comando;

function validaCNPJ($cnpj = null) {
	
	if(empty($cnpj)) {
		return false;
	}

	$cnpj = preg_replace("/[^0-9]/", "", $cnpj);
	$cnpj = str_pad($cnpj, 14, '0', STR_PAD_LEFT);
	
	if (strlen($cnpj) != 14) {
		return false;
	} else if ($cnpj == '00000000000000' || 
		$cnpj == '11111111111111' || 
		$cnpj == '22222222222222' || 
		$cnpj == '33333333333333' || 
		$cnpj == '44444444444444' || 
		$cnpj == '55555555555555' || 
		$cnpj == '66666666666666' || 
		$cnpj == '77777777777777' || 
		$cnpj == '88888888888888' || 
		$cnpj == '99999999999999') {
		return false;
		 
	 } else {   
	 
		$j = 5;
		$k = 6;
		$soma1 = "";
		$soma2 = "";

		for ($i = 0; $i < 13; $i++) {

			$j = $j == 1 ? 9 : $j;
			$k = $k == 1 ? 9 : $k;

			$soma2 += ($cnpj{$i} * $k);

			if ($i < 12) {
				$soma1 += ($cnpj{$i} * $j);
			}

			$k--;
			$j--;

		}

		$digito1 = $soma1 % 11 < 2 ? 0 : 11 - $soma1 % 11;
		$digito2 = $soma2 % 11 < 2 ? 0 : 11 - $soma2 % 11;

		return (($cnpj{12} == $digito1) and ($cnpj{13} == $digito2));
	 
	}
}

    if(!validaCNPJ($cnpj)){
        if($type == 'private') {
            apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
            apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*⚠️ CNPJ INVÁLIDO!*",
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));
        }else{
            apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
            apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*⚠️ CNPJ INVÁLIDO!*", "reply_to_message_id" => $message_id,
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    ))); 
        }
    } else {
   
    if($type == 'private') {
         apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
         apiRequest("sendMessage", array('chat_id' => $chat_id, 'text' => "🔍 Consultando... "));
     }else{
         apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
         apiRequest("sendMessage", array('chat_id' => $chat_id, 'text' => "🔍 Consultando... ", "reply_to_message_id"=> $message_id)); 
     }

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://open.cnpja.com/office/$cnpj");
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$data = curl_exec($ch);
curl_close($ch);

$json = json_decode($data, true);

// Função para pegar valor ou vazio
function getv($arr, $key) {
    return isset($arr[$key]) && $arr[$key] !== null ? $arr[$key] : '';
}

// Dados principais
$updated = getv($json, 'updated');
$taxId = getv($json, 'taxId');
$alias = getv($json, 'alias');
$founded = getv($json, 'founded');
$head = getv($json, 'head') ? 'Sim' : 'Não';

// Company
$company = getv($json, 'company');
$company_name = getv($company, 'name');
$equity = getv($company, 'equity');
$nature = getv($company, 'nature');
$nature_text = getv($nature, 'text');
$size = getv($company, 'size');
$size_text = getv($size, 'text');

// Simples/Simei
$simples = getv($company, 'simples');
$simples_optant = isset($simples['optant']) ? ($simples['optant'] ? 'Sim' : 'Não') : '';
$simei = getv($company, 'simei');
$simei_optant = isset($simei['optant']) ? ($simei['optant'] ? 'Sim' : 'Não') : '';

// Sócios
$members = getv($company, 'members');
$socios = '';
if (is_array($members)) {
    foreach ($members as $m) {
        $person = getv($m, 'person');
        $role = getv($m, 'role');
        $socios .= "NOME: " . getv($person, 'name') . "\n";
        $socios .= "CPF: " . getv($person, 'taxId') . "\n";
        $socios .= "IDADE: " . getv($person, 'age') . "\n";
        $socios .= "TIPO: " . getv($person, 'type') . "\n";
        $socios .= "FUNÇÃO: " . getv($role, 'text') . "\n";
        $socios .= "DESDE: " . getv($m, 'since') . "\n\n";
    }
}

// Status
$status = getv($json, 'status');
$status_text = getv($status, 'text');
$statusDate = getv($json, 'statusDate');

// Endereço
$address = getv($json, 'address');
$logradouro = getv($address, 'street');
$numero = getv($address, 'number');
$bairro = getv($address, 'district');
$cidade = getv($address, 'city');
$uf = getv($address, 'state');
$cep = getv($address, 'zip');
$complemento = getv($address, 'details');
$municipio = getv($address, 'municipality');
$pais = isset($address['country']['name']) ? $address['country']['name'] : '';

// Atividades
$mainActivity = getv($json, 'mainActivity');
$atividade_principal = getv($mainActivity, 'text');
$sideActivities = getv($json, 'sideActivities');
$atividades_secundarias = '';
if (is_array($sideActivities)) {
    foreach ($sideActivities as $sa) {
        $atividades_secundarias .= getv($sa, 'text') . "\n";
    }
}

// Telefones
$phones = getv($json, 'phones');
$telefone = '';
if (is_array($phones) && count($phones) > 0) {
    foreach ($phones as $p) {
        $telefone .= (isset($p['area']) ? "({$p['area']}) " : "") . getv($p, 'number') . "\n";
    }
}

// Emails
$emails = getv($json, 'emails');
$email = '';
if (is_array($emails) && count($emails) > 0) {
    foreach ($emails as $e) {
        $email .= getv($e, 'address') . "\n";
    }
}

// Inscrições estaduais
$registrations = getv($json, 'registrations');
$ies = '';
if (is_array($registrations)) {
    foreach ($registrations as $reg) {
        $ies .= "IE: " . getv($reg, 'number') . " - UF: " . getv($reg, 'state') . " - STATUS: " . (isset($reg['status']['text']) ? $reg['status']['text'] : '') . "\n";
    }
}

// Suframa
$suframa = getv($json, 'suframa');
$suframa_str = '';
if (is_array($suframa)) {
    foreach ($suframa as $s) {
        $suframa_str .= "NÚMERO: " . getv($s, 'number') . " - STATUS: " . (isset($s['status']['text']) ? $s['status']['text'] : '') . "\n";
    }
}

if($taxId){

    if($user_id != $adm && !$continuar2) {
        $arquivo = file_get_contents('botcon/usuarios.txt');
        $linhas = explode("\n", $arquivo);
        $palavra = $user_id;
        foreach($linhas as $linha => $valor) {
            $posicao = preg_match("/\b$palavra\b/i", $valor);                      
            if($posicao) {            
                $creditos_result = $creditos_list - 1;
                $linhas[$linha] =  $user_id.'|'.$creditos_result;
            }
        }
        $arquivo = implode("\n", $linhas);
        file_put_contents('botcon/usuarios.txt', $arquivo);                    
    }

    $redu = '1';
    $total = $message_id + $redu;               
    apiRequest("editMessageText", array('chat_id' => $chat_id, 'message_id' => $total, "parse_mode" => "Markdown", "text" => "🔍 *CONSULTA DE CNPJ* 🔍

*• CNPJ:* `$taxId`
*• NOME:* `$company_name`
*• NOME FANTASIA:* `$alias`
*• MATRIZ:* `$head`
*• ABERTURA:* `$founded`
*• SITUAÇÃO:* `$status_text`
*• DATA SITUAÇÃO:* `$statusDate`
*• PORTE:* `$size_text`
*• CAPITAL SOCIAL:* `R$ $equity`
*• NATUREZA JURÍDICA:* `$nature_text`
*• SIMPLES:* `$simples_optant`
*• SIMEI:* `$simei_optant`
*• ATIVIDADE PRINCIPAL:* `$atividade_principal`
*• ATIVIDADES SECUNDÁRIAS:* `$atividades_secundarias`
*• LOGRADOURO:* `$logradouro`
*• NÚMERO:* `$numero`
*• COMPLEMENTO:* `$complemento`
*• BAIRRO:* `$bairro`
*• MUNICÍPIO:* `$municipio`
*• CIDADE:* `$cidade`
*• ESTADO:* `$uf`
*• PAÍS:* `$pais`
*• CEP:* `$cep`
*• TELEFONE:* `$telefone`
*• EMAIL:* `$email`
*• INSCRIÇÕES ESTADUAIS:* `$ies`
*• SUFRAMA:* `$suframa_str`
*• QUADRO DE SÓCIOS E ADMINISTRADORES:*
$socios
*• ÚLTIMA ATUALIZAÇÃO:* `$updated`
",
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'apagar']))//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));
                                    
    include('divulgacao/divulgacao.php');

}else{

    $redu = '1';
    $total = $message_id + $redu;               
    apiRequest("editMessageText", array('chat_id' => $chat_id, 'message_id' => $total, "parse_mode" => "Markdown", "text" => "*⚠️ CNPJ NÃO ENCONTRADO!*",
    'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                          //linha 1
                                                         array(
                                                             array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                          )
                                                              
                                                )
                                        )));

}}}}else{
    if($type == 'private') {
            apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
            apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*⚠️ CNPJ INVÁLIDO!*",
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));
        }else{
            apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
            apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*⚠️ CNPJ INVÁLIDO!*", "reply_to_message_id" => $message_id,
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    ))); 
        }
}} else {
	
	apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
	apiRequest("sendMessage", array('chat_id' => $chat_id, "text" => "Os seus créditos, acabaram! Por favor, entre em contato com o meu desenvolvedor e compre mais créditos para continuar utilizando as consultas.

Desenvolvedor: @SRFioTi", "reply_to_message_id" => $message_id));

} 
	
?>