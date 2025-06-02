<?php 

error_reporting(0);
set_time_limit(0);

date_default_timezone_set('America/Recife');
$dt_atual = date("Y/m/d H:i:s");
$timestamp_dt_atual = strtotime($dt_atual);

$array_usuarios = file("botcon/usuarios.txt");
$total_usuarios_registrados = count($array_usuarios);

$array_grupos = file("botcon/grupos.txt");
$total_grupos_registrados = count($array_grupos);

$continuar = false;
for($i=0;$i<count($array_usuarios);$i++){
    $explode = explode("|" , $array_usuarios[$i]);
     if($user_id == $explode[0]){
         $creditos_list = $explode[1];
         $continuar = true;
     }
}

$continuar2 = false;
for($i=0;$i<count($array_grupos);$i++){
    $grupo_vip = explode("|" , $array_grupos[$i]);
     if($chat_id == "-$grupo_vip[0]"){
         $vencimento = $grupo_vip[1];
         $continuar2 = true;
     }
}

$timestamp_dt_expira = strtotime($vencimento);

if(!$continuar && !$continuar2){
    apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*Você não tem permissão para utilizar esse comando! Para se tornar um usuário VIP e ter acesso as consultas e os checkers, entre em contato com o meu desenvolvedor e contrate um plano.

Para mais informações ou para contratar, digite:* /planos", "reply_to_message_id" => $message_id)); 
} else if($timestamp_dt_atual < $timestamp_dt_expira || $creditos_list > 0){

$comando = str_replace(".", "", $comando);
$comando = str_replace("-", "", $comando);
	
if(strlen($comando) == 11){
	
$cpf = $comando;
	
function validaCPF($cpf = null) {

	if(empty($cpf)) {
		return false;
	}

	$cpf = preg_replace("/[^0-9]/", "", $cpf);
	$cpf = str_pad($cpf, 11, '0', STR_PAD_LEFT);
	
	if (strlen($cpf) != 11) {
		return false;
	} else if ($cpf == '00000000000' || 
		$cpf == '11111111111' || 
		$cpf == '22222222222' || 
		$cpf == '33333333333' || 
		$cpf == '44444444444' || 
		$cpf == '55555555555' || 
		$cpf == '66666666666' || 
		$cpf == '77777777777' || 
		$cpf == '88888888888' || 
		$cpf == '99999999999') {
		return false; 
	 } else {   
		
		for ($t = 9; $t < 11; $t++) {
			
			for ($d = 0, $c = 0; $c < $t; $c++) {
				$d += $cpf{$c} * (($t + 1) - $c);
			}
			$d = ((10 * $d) % 11) % 10;
			if ($cpf{$c} != $d) {
				return false;
			}
		}

		return true;
	}
}

    if(!validaCPF($cpf)){
               
        apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*⚠️ CPF INVÁLIDO!*", "reply_to_message_id" => $message_id,
        'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')                                                 
                                                      )
                                                          
                                            )
                                    )));
        
    } else {
       
       
$curl = curl_init();

curl_setopt_array($curl, array(
	CURLOPT_URL => "https://blackspacevpn.000webhostapp.com/pesquisas/FIOTI-BUSCAS/CpfCadsus.php?key=xK9xHtbKcGMFAwW&cpf=$cpf",
	CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
	CURLOPT_CUSTOMREQUEST => "GET"
));

$exe = curl_exec($curl);

curl_close($curl);


$json = json_decode($exe, true);


$telefones = $json['telefone'];
foreach($telefones as $itens){
$lista_telefones = "*• TELEFONE:* `(".$itens["ddd"].") ".$itens["numero"]."`\n*• TIPO:* `".$itens["tipoDescricao"]."`\n";

$lista_telefones_completa = $lista_telefones_completa."\n".$lista_telefones;
}

if(stripos($lista_telefones_completa, "(21) 2105-0000")) {
    $lista_telefones_completa = "";  
}

if(stripos($lista_telefones_completa, "(61) 3315-2425")) {
    $lista_telefones_completa = "";  
}

$numeroCns = $json['cns'];
$nome = $json['nome'];
$nomeMae = $json['nomeMae'];
$nomePai = $json['nomePai'];
$sexoDescricao = $json['sexoDescricao'];
$racaCorDescricao = $json['racaCorDescricao'];
$tipoSanguineo = $json['tipo sanguineo'];
$dataNascimento = $json['dataNascimento'];
$nacionalidade = $json['nacionalidade'];
$paisNascimento = $json['paisNascimento'];
$localNascimento = explode(' - ', $json['municipioNascimento']);
$municipioNascimento = $localNascimento[0];
$ufNascimento = $localNascimento[1];
$emailPrincipal = $json['email'][0]['emailDescricao'];
$paisResidenciaDescricao = $json['paisResidenciaDescricao'];
$localEndereco = explode(' - ', $json['enderecoMunicipio']);
$enderecoMunicipio = $localEndereco[0];
$enderecoUfNome = $localEndereco[1];
$enderecoTipoLogradouro = $json['enderecoTipoLogradouro'];
$enderecoLogradouro = $json['enderecoLogradouro'];
$enderecoNumero = $json['enderecoNumero'];
$enderecoComplemento = $json['enderecoComplemento'];
$enderecoBairro = $json['enderecoBairro'];
$enderecoCep = $json['enderecoCep'];
$rg = $json['rgDados'][0]['rgNumero'];
$dataExpedicaoRG = $json['rgDados'][0]['rgDataEmissao'];
$orgaoEmissorNome = $json['rgDados'][0]['rgOrgaoEmissorDescricao'];
$ufRG = $json['rgDados'][0]['rgUf'];
$tipoCertidao = $json['certidaoDados'][0]['certidaoTipo'];
$nomeCartorio = $json['certidaoDados'][0]['certidaoCartorio'];
$livro = $json['certidaoDados'][0]['livro'];
$folha = $json['certidaoDados'][0]['folha'];
$termo = $json['certidaoDados'][0]['termo'];
$dataEmissaoCertidao = $json['certidaoDados'][0]['dataEmissaoCertidao'];

If($nome != ""){
	
if(!$tipoSanguineo) {
    $tipoSanguineo = 'SEM INFORMAÇÃO';   
}

$separa = explode("/", $dataNascimento);
$dia = $separa[0];
$mes = $separa[1]; 
$ano = $separa[2];

if(!$ufNascimento) {
    $ufNascimento = 'SEM INFORMAÇÃO';   
}

if(!$municipioNascimento) {
    $municipioNascimento = 'SEM INFORMAÇÃO';   
}

if(!$emailPrincipal) {
    $emailPrincipal = 'SEM INFORMAÇÃO';   
}

if(!$enderecoTipoLogradouro) {
    $enderecoTipoLogradouro = 'SEM INFORMAÇÃO';   
}

if(!$enderecoLogradouro) {
    $enderecoLogradouro = 'SEM INFORMAÇÃO';     
}

if(!$enderecoNumero) {
    $enderecoNumero = 'SEM INFORMAÇÃO';   
}

if(!$enderecoComplemento) {
    $enderecoComplemento = 'SEM INFORMAÇÃO';   
}

if(!$enderecoBairro) {
    $enderecoBairro = 'SEM INFORMAÇÃO';   
}

if(!$enderecoMunicipio) {
    $enderecoMunicipio = 'SEM INFORMAÇÃO';   
}

if(!$enderecoUfNome) {
    $enderecoUfNome = 'SEM INFORMAÇÃO';   
}

if(!$paisResidenciaDescricao) {
    $paisResidenciaDescricao = 'SEM INFORMAÇÃO';   
}

if(!$enderecoCep) {
    $enderecoCep = 'SEM INFORMAÇÃO';   
}

if(!$rg) {
    $rg = 'SEM INFORMAÇÃO';
    $orgaoEmissorNome = 'SEM INFORMAÇÃO';
    $dataExpedicaoRG = 'SEM INFORMAÇÃO';
    $ufRG = 'SEM INFORMAÇÃO';
}

if(!$nomeCartorio) {
	$tipoCertidao = 'SEM INFORMAÇÃO'; 
    $nomeCartorio = 'SEM INFORMAÇÃO';
    $livro = 'SEM INFORMAÇÃO';
    $folha = 'SEM INFORMAÇÃO';
    $termo = 'SEM INFORMAÇÃO';
    $dataEmissaoCertidao = 'SEM INFORMAÇÃO';
}

$hoje = mktime(0, 0, 0, date('m'), date('d'), date('Y'));
$nascido = mktime( 0, 0, 0, $mes, $dia, $ano);
$idade = floor((((($hoje - $nascido) / 60) / 60) / 24) / 365.25);

function signo($dia, $mes) {
    if ($mes == "03"  && $dia >= "20") { 
$signo = "Áries";       
    } elseif ($mes == "04" && $dia <= "20") { 
$signo = "Áries";       
    } elseif ($mes == "04" && $dia >= "21") { 
$signo = "Touro";      
    } elseif ($mes == "05" && $dia <= "20") { 
$signo = "Touro";      
    } elseif ($mes == "05" && $dia >= "21") { 
$signo = "Gêmeos";     
    } elseif ($mes == "06" && $dia <= "20") { 
$signo = "Gêmeos";      
    } elseif ($mes == "06" && $dia >= "21") { 
$signo = "Câncer";     
    } elseif ($mes == "07" && $dia <= "21") { 
$signo = "Câncer";     
    } elseif ($mes == "07" && $dia >= "22") { 
$signo = "Leão";        
    } elseif ($mes == "08" && $dia <= "22") {
 $signo = "Leão";        
    } elseif ($mes == "08" && $dia >= "23") { 
$signo = "Virgem";      
    } elseif ($mes == "09" && $dia <= "22") { 
$signo = "Virgem";      
    } elseif ($mes == "09" && $dia >= "23") { 
$signo = "Libra";       
    } elseif ($mes == "10" && $dia <= "22") { 
$signo = "Libra";       
    } elseif ($mes == "10" && $dia >= "23") { 
$signo = "Escorpião";   
    } elseif ($mes == "11" && $dia <= "21") { 
$signo = "Escorpião";   
    } elseif ($mes == "11" && $dia >= "22") { 
$signo = "Sagitário";  
    } elseif ($mes == "12" && $dia <= "21") { 
$signo = "Sagitário";   
    } elseif ($mes == "12" && $dia >= "22") { 
$signo = "Capricórnio"; 
    } elseif ($mes == "01" && $dia <= "21") { 
$signo = "Capricórnio"; 
    } elseif ($mes == "01" && $dia >= "21") { 
$signo = "Aquário";     
    } elseif ($mes == "02" && $dia <= "18") { 
$signo = "Aquário";     
    } elseif ($mes == "02" && $dia >= "19") { 
$signo = "Peixes";      
    } elseif ($mes == "03" && $dia <= "19") { 
$signo = "Peixes";      
    } else { $signo = "Não Reconhecido"; }
return $signo;
}

$signo = strtoupper(signo($dia, $mes));

apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "🔍 *CONSULTA  DE  CPF* 🔍

*• CPF:* `$cpf`

*• CNS:* `$numeroCns`

*• RG:* `$rg`
*• DATA DE EXPEDIÇÃO:* `$dataExpedicaoRG`
*• ORGÃO EXPEDIDOR:* `$orgaoEmissorNome`
*• UF - RG:* `$ufRG`

*• NOME:* `$nome`
*• NASCIMENTO:* `$dataNascimento`
*• IDADE:* `$idade`
*• SIGNO:* `$signo`

*• SEXO:* `$sexoDescricao`
*• COR:* `$racaCorDescricao`
*• TIPO SANGUÍNEO:* `$tipoSanguineo`

*• MÃE:* `$nomeMae`
*• PAI:* `$nomePai`

*• PAÍS DE NASCIMENTO:* `$paisNascimento`
*• CIDADE DE NASCIMENTO:* `$municipioNascimento`
*• ESTADO DE NASCIMENTO:* `$ufNascimento`

*• TIPO DE CERTIDÃO:* `$tipoCertidao`
*• NOME DO CARTORIO:* `$nomeCartorio`
*• LIVRO:* `$livro`
*• FOLHA:* `$folha`
*• TERMO:* `$termo`
*• DATA DE EMISSÃO:* `$dataEmissaoCertidao`

*• TIPO DE LOGRADOURO:* `$enderecoTipoLogradouro`
*• LOGRADOURO:* `$enderecoLogradouro`
*• NÚMERO:* `$enderecoNumero`
*• COMPLEMENTO:* `$enderecoComplemento`
*• BAIRRO:* `$enderecoBairro`
*• CIDADE:* `$enderecoMunicipio`
*• ESTADO:* `$enderecoUfNome`
*• PAÍS:* `$paisResidenciaDescricao`
*• CEP:* `$enderecoCep`

*• E-MAIL:* `$emailPrincipal`
$lista_telefones_completa

*• PARA SABER O VALOR DO SEU SALDO.*

*• DIGITE:* /saldo

🔛 *BOT:* @fiotibuscasbot

🔛 *GRUPO OFICIAL:* @consultarcpfplus", "reply_to_message_id" => $message_id,
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                                                                          
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'apagar']))//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));

include('divulgacao/divulgacao.php');
	
    if(!$continuar2 || $timestamp_dt_atual > $timestamp_dt_expira){
	
	$arquivo = file_get_contents('botcon/usuarios.txt');
    $linhas = explode("\n", $arquivo);
    $palavra = $user_id;
    foreach($linhas as $linha => $valor) {
        $posicao = preg_match("/\b$palavra\b/i", $valor);                      
        if($posicao) {
            $creditos_list = intval($creditos_list) - intval(1);
            $linhas[$linha] = $user_id.'|'.$creditos_list;
        }
    }
    $arquivo = implode("\n", $linhas);
    file_put_contents('botcon/usuarios.txt', $arquivo);                    
	
    }

}else{
    
    apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*⚠️ CPF NÃO ENCONTRADO!*", "reply_to_message_id" => $message_id,
    'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')                                                   
                                                      )
                                                          
                                            )
                                    )));

}}}else{
    
    apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*⚠️ CPF INVÁLIDO!*", "reply_to_message_id" => $message_id,
    'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')                                                
                                                      )
                                                          
                                            )
                                    )));
        
}} else {
	
	apiRequest("sendMessage", array('chat_id' => $chat_id, "text" => "Os seus créditos, acabaram! Por favor, entre em contato com o meu desenvolvedor e compre mais créditos para continuar utilizando as consultas.

Desenvolvedor: @SRFioTi", "reply_to_message_id" => $message_id));

}  
	
?>