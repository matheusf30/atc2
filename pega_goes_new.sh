#!/bin/bash
#
######################################################################
### ESTE SCRIPT PEGA DADOS DO SATELITE GOES DO SITE DO CPTEC/INPE  ###
### Exercício de Aula de Tratamento de Dados                       ### 
###                                                                ### 
### CTMET/IFSC                                                     ###
###                                                                ### 
### Mudança do Satélite GOES16 para GOES19 no dia 07/04/2025       ###
###                                                                ### 
### Elaborado:          MARIO QUADRO       	       -FEB, 26th 2023 ###
### Adaptado:           MATHEUS FERREIRA DE SOUZA  -MAR, 02nd 2026 ###
######################################################################
#
export LC_NUMERIC=en_US.UTF-8
#
###----------------------------------------------------------------###
### SETANDO PATHS                                                  ###
###----------------------------------------------------------------###
#
path_scr=$HOME/matheus/atc2
path_arq=$path_scr/images
#
mkdir -p $HOME/matheus/atc2
mkdir -p $path_scr
mkdir -p $path_arq
#
cd $path_arq
#
rm -rf $path_arq/*.jpg*
rm -rf $path_arq/*.gif*
#
###--------------------------------------------------------------------###
### Criar as variáveis meses                                           ###
###--------------------------------------------------------------------###
#
mo=(' ' 'Jan' 'Feb' 'Mar' 'Apr' 'May' 'Jun' 'Jul' 'Aug' 'Sep' 'Oct' 'Nov' 'Dec')
mt=(' ' 'JAN' 'FEB' 'MAR' 'APR' 'MAY' 'JUN' 'JUL' 'AUG' 'SEP' 'OCT' 'NOV' 'DEC')
#
###--------------------------------------------------------------------###
### faz loop nos arquivos e pega data inicial                          ###
###--------------------------------------------------------------------###
#
#
# Define Data Inicial
#
ai=2026
mi=03
di=02
hi=00
#
# Define Data Final
#
af=2026
mf=03
df=02
hf=23
#
# Define Intervalo em horas para pegar as imagens
#
inc=1
#
#
##--------------------------------------------------------------------###
### Define Hora Inicial (si), Horário Final (sf) e Faz a conta de     ### 
### quantos horários terá o loop (cont_horas)                          ###
###--------------------------------------------------------------------###
#

si=`date -u --date="$ai$mi$di $hi" +%s`;# Linux
#si=`date -j -v +0H -f "%Y%m%d%H" "$ai$mi$di$hi" +%s`;# mac

sf=`date -u --date="$af$mf$df $hf" +%s`
#sf=`date -j -v +0H -f "%Y%m%d%H" "$af$mf$df$hf" +%s`;# mac
#
echo $si
echo $sf
#
#cont_horas=`echo "scale=0; ($sf - $si)/3600/24/30" | bc -l`
cont_horas=`echo "scale=0; 1 + ($sf - $si)/(3600*$inc)" | bc -l`
loop_anim=$((cont_horas-1))
#
echo "Data Inicial         -> "$ai $mi $di $hi
echo "data Final           -> "$af $mf $df $hf
echo "No Horas             -> "$cont_horas
#
#---------------------------------------------------------------------------#
# Loop para juntar os dados e Gerar  ctl e roda gribmap                     #
#---------------------------------------------------------------------------#
#
# faz o loop do período de dados
for (( i = 0; i < $cont_horas; i++ ))
do
  j=$((i*inc))
#
  data=`date -u --date="$ai$mi$di $hi + $j hours" +%Y%m%d%H`'00';# Linux
  datv=`date -u --date="$ai$mi$di $hi + $j hours" +%Y%m%d`;# Linux
  ano=`date -u --date="$ai$mi$di $hi + $j hours" +%Y`;# Linux
  mes=`date -u --date="$ai$mi$di $hi + $j hours" +%m`;# Linux
  dia=`date -u --date="$ai$mi$di $hi + $j hours" +%d`;# Linux
  hor=`date -u --date="$ai$mi$di $hi + $j hours" +%H`;# Linux
  #
  #  data=`date -j -v +${j}H -f "%Y%m%d%H" "$ai$mi$di$hi" +%Y%m%d%H`'00';# mac
  #  ano=`date -j -v +${j}H -f "%Y%m%d%H" "$ai$mi$di$hi" +%Y`;# mac
  #  mes=`date -j -v +${j}H -f "%Y%m%d%H" "$ai$mi$di$hi" +%m`;# mac
  #  dia=`date -j -v +${j}H -f "%Y%m%d%H" "$ai$mi$di$hi" +%d`;# mac
  #  hor=`date -j -v +${j}H -f "%Y%m%d%H" "$ai$mi$di$hi" +%H`;# mac
  #
  echo "Data -> "$data $ano $mes $dia $hor
  #
  # faz o loop dos cacnais das imagens
  #
  for (( k = 1; k <= 3; k++ ))
  do
    #
    # Define o Canal da Imagem
    #
    # Visível 
    if  [ $k -eq 1 ]; then 
     # Mudança do Satélite GOES16 para GOES19 no dia 07/04/2025
     if  [ $datv -le 20250407 ]; then  
      img=S11635368 ; sat=16 
     else 
      img=S11161203 ; sat=19
     fi 
     dir=ams_ret_ch03_baixa ; canal=vis ; ch=03 ; fi
    # Vapor  
    if  [ $k -eq 2 ]; then 
     # Mudança do Satélite GOES16 para GOES19 no dia 07/04/2025
     if  [ $datv -le 20250407 ]; then
      img=S11635378 ; sat=16 
     else 
      img=S11161208 ; sat=19
     fi 
     dir=ams_ret_ch08_baixa ; canal=vap ; ch=08 ; fi
    # Infravermelho 
    if  [ $k -eq 3 ]; then 
     # Mudança do Satélite GOES16 para GOES19 no dia 07/04/2025
     if  [ $datv -le 20250407 ]; then 
      img=S11635388 ; sat=16 
     else 
      img=S11161213 ; sat=19
     fi 
     dir=ams_ret_ch13_baixa ; canal=ir  ; ch=13 ; fi
    #
    #wget http://satelite.cptec.inpe.br/repositoriogoes/goes16/goes16_web/$dir/$ano/$mes/${img}_$data.jpg
    wget https://satelite.cptec.inpe.br/repositoriogoes/goes${sat}/goes${sat}_web/${dir}/${ano}/${mes}/${img}_${data}.jpg
    # ch3  https://satelite.cptec.inpe.br/repositoriogoes/goes19/goes19_web/ams_ret_ch03_baixa/2025/04/S11161203_202504080800.jpg
    # ch8  https://satelite.cptec.inpe.br/repositoriogoes/goes19/goes19_web/ams_ret_ch08_baixa/2025/04/S11161208_202504082300.jpg
    # ch13 https://satelite.cptec.inpe.br/repositoriogoes/goes19/goes19_web/ams_ret_ch13_baixa/2025/04/S11161213_202504142000.jpg
    #
    # Reduz o tamanh da Imagem para poder gerar a animação
    #
    /usr/bin/convert -resize 50% ${img}_$data.jpg ${img}_$data.jpg
    #
    # Escreve legenda na Imagem
    #
    #/usr/bin/convert -fill white -draw "rectangle 48,110 1000,170" ${img}_$data.jpg -fill black -pointsize 80 -draw 'text 75,170 "CH08 '$dia'/'$mes'/'$ano' '$hor' UTC"' ${img}.jpg
    /usr/bin/convert -fill white -draw "rectangle 48,60 1000,120" ${img}_$data.jpg -fill black -pointsize 80 -draw 'text 75,120 "CH'${ch}' '$dia'/'$mes'/'$ano' '$hor' UTC"' ${img}.jpg
    #
    mv ${img}.jpg ${img}_$data.jpg
  
    #
    #---------------------------------------------------------------------------#
    # Gera Animação das Imagens do Satélite GOES-16                             #
    #---------------------------------------------------------------------------#
    #
    if  [ $i -eq $loop_anim ]; then  
     #
     echo """"""""""""""""""""""""""""""""""""""""""""""""""""
     echo "Wait.. Gerando Animacao das Imagens do GOES ......"
     echo """"""""""""""""""""""""""""""""""""""""""""""""""""
     #
     /usr/bin/convert -delay 70 -loop 0 ${img}_*.jpg anima_${canal}_${ch}_${dia}.gif
    fi
  done  
  
done; # termina loop das estacoes
#
pwd
#---------------------------------------------------------------------------#
# Encerra o script                                                          #
#---------------------------------------------------------------------------#
#
exit
