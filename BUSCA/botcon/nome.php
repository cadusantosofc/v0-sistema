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

if(preg_match('/\d+/', $comando)>0 ){
    
apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*⚠️ NOME INVÁLIDO!*", "reply_to_message_id" => $message_id,
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));

}else{

$nome = preg_replace("/ /i", "%20", $comando);

function getStr($string, $start, $end) {
	$str = explode($start, $string);
	$str = explode($end, $str[1]);
	return $str[0];
}

$cht = curl_init();
curl_setopt($cht, CURLOPT_URL, "https://blackspacevpn.000webhostapp.com/pesquisas/FIOTI-BUSCAS/NomeTarget.php?key=gFjQpehz9dfndR2&nome=$nome");
curl_setopt($cht, CURLOPT_RETURNTRANSFER, true); 
curl_setopt($cht, CURLOPT_TIMEOUT, 30); 
$exe = curl_exec($cht);

$json = json_decode($exe, true);

$i = 1;

foreach($json as $itens){
   
$numeroCns = $itens['numeroCns'];
$nome = $itens['nome'];
$nomeMae = $itens['nomeMae'];
$nomePai = $itens['nomePai'];
$vivo = $itens['vivo'];
$racaCorDescricao = $itens['racaCorDescricao'];
$dataNascimento = $itens['dataNascimento'];
$nacionalidade = $itens['nacionalidade'];
$municipioNascimento = $itens['municipioNascimento'];
$ufNascimento = $itens['ufNascimento'];
$enderecoMunicipio = $itens['enderecoMunicipio'];
$enderecoUfNome = $itens['enderecoUfNome'];
$enderecoTipoLogradouro = $itens['enderecoTipoLogradouro'];
$enderecoLogradouro = $itens['enderecoLogradouro'];
$enderecoNumero = $itens['enderecoNumero'];
$enderecoBairro = $itens['enderecoBairro'];
$enderecoComplemento = $itens['enderecoComplemento'];
$enderecoCep = $itens['enderecoCep'];
$ddd = $itens['telefone'][0]['ddd'];
$numero = $itens['telefone'][0]['numero'];
$tipoDescricao = $itens['telefone'][0]['tipoDescricao'];
$cpf = $itens['cpf'];
$rg = $itens['rg'];
$dataExpedicaoRG = $itens['dataExpedicaoRG'];
$orgaoEmissorNome = $itens['orgaoEmissorNome'];
$ufRG = $itens['ufRG'];

if(!$rg) {
    $rg = 'SEM INFORMAÇÃO';
    $orgaoEmissorNome = 'SEM INFORMAÇÃO';
    $dataExpedicaoRG = 'SEM INFORMAÇÃO';
    $ufRG = 'SEM INFORMAÇÃO';
}else{
	$separaDataExpedicaoRG = explode("/", $dataExpedicaoRG);
    $mesExpedicaoRG = $separaDataExpedicaoRG[0];
    $diaExpedicaoRG = $separaDataExpedicaoRG[1]; 
    $anoExpedicaoRG = $separaDataExpedicaoRG[2];
    $dataExpedicaoRG = "$diaExpedicaoRG/$mesExpedicaoRG/$anoExpedicaoRG";
}

if(!$enderecoLogradouro) {
    $enderecoTipoLogradouro = 'SEM INFORMAÇÃO';
    $enderecoLogradouro = 'SEM INFORMAÇÃO';
    $enderecoBairro = 'SEM INFORMAÇÃO';
    $enderecoMunicipio = 'SEM INFORMAÇÃO';
    $enderecoUfNome = 'SEM INFORMAÇÃO'; 
    $paisResidenciaDescricao = 'SEM INFORMAÇÃO';   
}

if(!$enderecoComplemento) {
    $enderecoComplemento = 'SEM INFORMAÇÃO';   
}

if(!$enderecoCep) {
    $enderecoCep = 'SEM INFORMAÇÃO';   
}

if(!$ufNascimento) {
    $ufNascimento = 'SEM INFORMAÇÃO';   
}

$separa = explode("/", $dataNascimento);
$dia = $separa[0];
$mes = $separa[1]; 
$ano = $separa[2];

$dataNascimento = "$dia/$mes/$ano";

$vivo = strtoupper($vivo);

if(!$numero) {
    $ddd = 'SEM INFORMAÇÃO';    
    $tipoDescricao = 'SEM INFORMAÇÃO';    
}

$dados = "*• RESULTADO: ".$i."*\n\n• NOME: `".$nome."`\n• CNS: `".$numeroCns."`\n• CPF: `".$cpf."`\n• RG: `".$rg."`\n• DATA DE EXPEDIÇÃO: `".$dataExpedicaoRG."`\n• ORGÃO EXPEDIDOR: `".$orgaoEmissorNome."`\n• NASCIMENTO: `".$dataNascimento."`\n• VIVO: `".$vivo."`\n• COR: `".$racaCorDescricao."`\n• MÃE: `".$nomeMae."`\n• PAI: `".$nomePai."`\n• NACIONALIDADE: `".$nacionalidade."`\n• CIDADE DE NASCIMENTO: `".$municipioNascimento."`\n• ESTADO DE NASCIMENTO: `".$ufNascimento."`\n• LOGRADOURO: `".$enderecoLogradouro.", ".$enderecoNumero."`\n• COMPLEMENTO: `".$enderecoComplemento."`\n• BAIRRO: `".$enderecoBairro."`\n• CIDADE: `".$enderecoMunicipio."`\n• ESTADO: `".$enderecoUfNome."`\n• CEP: `".$enderecoCep."`\n• TELEFONE: `".$ddd." ".$numero."`\n• TIPO: `".$tipoDescricao."`\n\n";
   
$titulos = $titulos."\n".$dados;

$i++;

}

If($titulos != ""){
	
apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "🔍 *CONSULTA  DE  NOME* 🔍
$titulos
*• PARA SABER O VALOR DO SEU SALDO.*

*• DIGITE:* /saldo

🔛 *BOT:* @fiotibuscasbot

🔛 *GRUPO OFICIAL:* @consultarcpfplus", "reply_to_message_id" => $message_id,
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                                                                          
                                                      //linha 2
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'apagar']))//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));
                                    


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
	
}}else{
    
apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*⚠️ NOME NÃO ENCONTRADO!*", "reply_to_message_id" => $message_id,
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));

}}}} else {
	
	apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
	apiRequest("sendMessage", array('chat_id' => $chat_id, "text" => "Os seus créditos, acabaram! Por favor, entre em contato com o meu desenvolvedor e compre mais créditos para continuar utilizando as consultas.

Desenvolvedor: @SRFioTi", "reply_to_message_id" => $message_id));

} 
	
?>