<?php

if(strpos($comando,".") !== false ){

$ip = $comando;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL,"https://www.localizaip.com.br/localizar-ip.php?ip=$ip");
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$data = curl_exec($ch);
curl_close ($ch);

$var1 = explode('id="ip" value="', $data);
$var2 = explode('">', $var1[1]);

$var3 = explode('[countryName] => ', $data);
$var4 = explode('
    ', $var3[1]);

$var5 = explode('Estado:<b>', $data);
$var6 = explode('</b><br>', $var5[1]);

$var7 = explode('Cidade:<b>', $data);
$var8 = explode('</b><br><br>', $var7[1]);

$var9 = explode('[latitude] => ', $data);
$var10 = explode('
    ', $var9[1]);

$var11 = explode('[longitude] => ', $data);
$var12 = explode('
    ', $var11[1]);

$var15 = explode('[isp] => ', $data);
$var16 = explode('
)', $var15[1]);

$var17 = explode('IP-Reverso:<b>', $data);
$var18 = explode('</b><br>', $var17[1]);

//$ch = curl_init();

//curl_setopt($ch, CURLOPT_URL, "http://www.geoplugin.net/php.gp?ip=$ip");
//curl_setopt($ch, CURLOPT_HEADER, 0);
//curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
//curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
//$data = curl_exec($ch);

//curl_close($ch);

$cot1 = explode('"geoplugin_request";s:', $data);
$cot2 = explode(':"', $cot1[1]);
$cot2B = explode('";', $cot2[1]);

$cot3 = explode('"geoplugin_city";s:', $data);
$cot4 = explode(':"', $cot3[1]);
$cot4B = explode('";', $cot4[1]);

$cot5 = explode('"geoplugin_region";s:', $data);
$cot6 = explode(':"', $cot5[1]);
$cot6B = explode('";', $cot6[1]);

$cot8 = explode('"geoplugin_regionCode";s:', $data);
$cot9 = explode(':"', $cot8[1]);
$cot9B = explode('";', $cot9[1]);

$cot11 = explode('"geoplugin_countryCode";s:', $data);
$cot12 = explode(':"', $cot11[1]);
$cot12B = explode('";', $cot12[1]);

$cot14 = explode('"geoplugin_countryName";s:', $data);
$cot15 = explode(':"', $cot14[1]);
$cot15B = explode('";', $cot15[1]);

$cot17 = explode('"geoplugin_continentName";s:', $data);
$cot18 = explode(':"', $cot17[1]);
$cot18B = explode('";', $cot18[1]);

$cot20 = explode('"geoplugin_latitude";s:', $data);
$cot21 = explode(':"', $cot20[1]);
$cot21B = explode('";', $cot21[1]);

$cot22 = explode('"geoplugin_longitude";s:', $data);
$cot23 = explode(':"', $cot22[1]);
$cot23B = explode('";', $cot23[1]);

$cot24 = explode('"geoplugin_currencyCode";s:', $data);
$cot25 = explode(':"', $cot24[1]);
$cot25B = explode('";', $cot25[1]);

$cot26 = explode('"geoplugin_currencySymbol_UTF8";s:', $data);
$cot27 = explode(':"', $cot26[1]);
$cot27B = explode('";', $cot27[1]);

$cot28 = explode('"geoplugin_currencyConverter";s:', $data);
$cot29 = explode(':"', $cot28[1]);
$cot29B = explode('";', $cot29[1]);

if($var4[0] == "" && $var6[0] == "") {

apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "🔍 *CONSULTA DE IP* 🔍

*• IP NÃO ENCONTRADO!*

🔛 *BY:* @fiotibuscasbot", "reply_to_message_id"=> $message_id,
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                 
                                                      )
                                                          
                                            )
                                    )));

}else{

apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "🔍 *CONSULTA DE IP* 🔍

*• IP:* `$var2[0]`
*• PAÍS:* `$var4[0]`
*• ESTADO:* `$var6[0]`
*• CIDADE:* `$var8[0]`
*• LATITUDE:* `$var10[0]`
*• LONGITUDE:* `$var12[0]`
*• PROVEDOR:* `$var16[0]`
*• IP REVERSO:* `$var18[0]`

🔛 *BOT:* @fiotibuscasbot

🔛 *GRUPO OFICIAL:* @consultarcpfplus", "reply_to_message_id"=> $message_id,
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'apagar']))//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));
                                    
if($var10[0] != 0 || $var12[0] != 0) {
 
apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'find_location'));
//apiRequest("sendPhoto", array('chat_id' => $chat_id, "reply_to_message_id" => $message_id, "photo" => 'https://maps.googleapis.com/maps/api/staticmap?center='.$var10[0].','.$var12[0].'&key=AIzaSyDBV_FOGKFG9B8wuZL6YSgq_Q8A1PejOXc&zoom=14&scale=false&size=330x300&maptype=roadmap&format=png&visual_refresh=true&markers=size:large%7Ccolor:0xff0000%7C'.$var10[0].','.$var12[0]));
apiRequest("sendLocation", array('chat_id' => $chat_id, "reply_to_message_id" => $message_id, 'latitude' => $var10[0], 'longitude' => $var12[0],
'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>serialize(['id'=>$user_id, 'data'=>'apagarFoto']))//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));

}}
}else{
	
	apiRequest("sendChatAction", array('chat_id' => $chat_id, 'action' => 'typing'));
	apiRequest("sendMessage", array('chat_id' => $chat_id, "parse_mode" => "Markdown", "text" => "*IP Checker* - _Consulta o número de IP, obtém dados do número de IP, como qual é o provedor, ip reverso e país, estado, cidade e as coordenadas de onde ele está localizado.

Formato:_
204.152.203.157

`/ip 204.152.203.157`", "reply_to_message_id"=> $message_id,
   'reply_markup' => array('inline_keyboard' => array(                                                                                                                                                    
                                                      //linha 1
                                                     array(
                                                         array('text'=>'🚮  Apagar  🚮',"callback_data"=>'apagar')//botão com callback                                                   
                                                      )
                                                          
                                            )
                                    )));
}
   
?>