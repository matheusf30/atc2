function geral(args)
'reinit'
#
#########################################################################
###                                                                   ###
### Script desenvolvido pelos alunos da Terceira Fase do CTMET/IFSC   ###
### Gera Mapas Varáveis Meteorológicas utilizadas no Seminario Fianl  ###
### a partir do modelo GFS.                                           ###
###                                                                   ###
### Como executar:                                                    ###
### grads -pc "run gfs_1p00_lsn3.gs aaaammddhh "                      ###  
###                                                                   ###
###                       QUADRO, MARIO  Aug, 02th 2010 - CCM/IFSC    ###
### Adaptado por: Matheus Ferreira de Souza (15/06/2026)              ###
#########################################################################
#
# #########################################################################
# Capturando os 3 argumentos do terminal:
# arg1 = data_inicial (aaaammddhh)
# arg2 = data_final   (aaaammddhh)
# arg3 = intervalo_horas (ex: 6)
# #########################################################################
data_ini = subwrd(args,1)
data_fim = subwrd(args,2)
intervalo = subwrd(args,3)
if (data_ini = '' | data_fim = '' | intervalo = '')
  say 'ERRO: Sintaxe correta: run gfs_laço.gs DATA_INI DATA_FIM INTERVALO'
  say 'Exemplo: grads -pc "run gfs_laço.gs 2026061500 2026061612 6"'
  return
endif

_path_dat='/home/aluno/matheus/atc2'
_path_fig='figuras'

# 1. Abre um arquivo estático ou o primeiro arquivo para permitir o uso de funções de tempo do GrADS
# Nota: Ajuste o caminho abaixo se os arquivos mudarem de pasta por data.
'open '_path_dat'/'data_ini'/gfs_'data_ini'.ctl'

# 2. Converte as datas informadas em formatos que o GrADS entende (usando máscaras de tempo)
# Transforma aaaammddhh em hhZddmmmaaaa (ex: 2026061500 -> 00Z15JUN2026)
t_ini = grads_time(data_ini)
t_fim = grads_time(data_fim)

# 3. Descobre o número do "Time Step" (t) correspondente à data inicial e final no arquivo aberto
'set time 't_ini
'q dim'
line = sublin(result,5)
t_start = subwrd(line,9)

'set time 't_fim
'q dim'
line = sublin(result,5)
t_end = subwrd(line,9)

# Calcula o passo em unidades do GrADS (se o arquivo for de 3h em 3h e você quer de 6h, o passo de 't' será 2)
# Para descobrir o incremento em 't', vemos quanto 1 passo de 't' avança em horas:
'set t 't_start
'q time'
time1 = subwrd(result,3)
'set t 't_start+1
'q time'
time2 = subwrd(result,3)

# Se o seu arquivo .ctl já for de 6h em 6h, o incremento_t será igual ao intervalo/6 (geralmente 1)
# Vamos automatizar o loop baseando-se no tempo real (convertendo o intervalo de horas para passos de 't')
'set time 't_ini
'set hh 'intervalo
'q time'  ; # truque para ver o avanço
# Para simplificar e evitar bugs de fuso/calendário, usaremos um loop WHILE baseado no tempo string:

atual_t = t_start

############################################
### INÍCIO DO LAÇO DE REPETIÇÃO          ###
############################################
while (atual_t <= t_end)
  'set t 'atual_t
  'q time'
  tempo_atual = subwrd(result,3)
  
  # Extrai os dados do tempo atual para montar as pastas (Ex: 00Z15JUN2026)
  _hora = substr(tempo_atual,1,2)
  _dia  = substr(tempo_atual,4,2)
  _mes_str = substr(tempo_atual,6,3)
  _ano  = substr(tempo_atual,9,4)
  
  # Convertendo o mês em formato texto para número para manter seu padrão de pastas
  _mes = converte_mes(_mes_str)
  
  # Define caminhos dinâmicos para a iteração atual
  '!mkdir -p '_path_fig
  _path_png=_path_fig'/'_ano%_mes%_dia%_hora
  '!mkdir -p '_path_png
  _path_desc=_path_dat
  
  _tipmod='draw string 6.7 .3 MODELO GLOBAL GFS0p50 - NCEP'
  _rsl=' '
  
  # Se os arquivos .ctl forem separados por data, feche o anterior e abra o atual aqui:
  # 'close 1'
  # 'open '_path_desc'/'_ano%_mes%_dia%_hora'/gfs_'_ano%_mes%_dia%_hora'.ctl'
  
  'set mpdset brmap_hires'
  'run /usr/share/grads/define_colors.gs'
  'set lat -50 0'
  'set lon -80 -25'
  
  anl = tempo_atual

  # =========================================================================
  # [DAQUI PARA BAIXO SEGUE O SEU CÓDIGO DE GERAR OS MAPAS...]
  # NOTA: Remova ou comente os comandos "pull c" de dentro do laço para 
  # evitar que o script pause a cada mapa gerado, permitindo rodar tudo direto!
  # =========================================================================
  
  # ... (Seus blocos de mapas: Mapa de Temperatura, UR, Ventos, etc.) ...
  
  
  # [FIM DO SEU CÓDIGO DE GERAR MAPAS]
  # =========================================================================

  # Avança o laço somando o intervalo em horas convertido para passos de 't'
  # Se o arquivo tem resolução de 3h, e o usuário pediu 6h, avança 2 't'. 
  # Ajuste estático: se seu arquivo varia de 6h em 6h fixo, use: atual_t = atual_t + 1
  # Caso varie de 1h em 1h e o input seja 6, use: atual_t = atual_t + intervalo
  
  atual_t = atual_t + (intervalo / 3) # Exemplo se o CTL original for de 3 em 3 horas.
  # Se o CTL original for de 6h em 6h, mude para: atual_t = atual_t + 1

endwhile

say '==============================================='
say '|      TODOS OS PERÍODOS PROCESSADOS!         |'
say '==============================================='
'quit'


# #########################################################################
# FUNÇÕES AUXILIARES (Devem ficar no final do arquivo, abaixo do marcador)
# #########################################################################

function grads_time(data_input)
  ano = substr(data_input,1,4)
  mes_num = substr(data_input,5,2)
  dia = substr(data_input,7,2)
  hora = substr(data_input,9,2)
  
  if (mes_num = '01'); mes_str = 'JAN'; endif
  if (mes_num = '02'); mes_str = 'FEB'; endif
  if (mes_num = '03'); mes_str = 'MAR'; endif
  if (mes_num = '04'); mes_str = 'APR'; endif
  if (mes_num = '05'); mes_str = 'MAY'; endif
  if (mes_num = '06'); mes_str = 'JUN'; endif
  if (mes_num = '07'); mes_str = 'JUL'; endif
  if (mes_num = '08'); mes_str = 'AUG'; endif
  if (mes_num = '09'); mes_str = 'SEP'; endif
  if (mes_num = '10'); mes_str = 'OCT'; endif
  if (mes_num = '11'); mes_str = 'NOV'; endif
  if (mes_num = '12'); mes_str = 'DEC'; endif
  
  return hora'Z'dia%mes_str%ano

function converte_mes(mes_str)
  if (mes_str = 'JAN'); return '01'; endif
  if (mes_str = 'FEB'); return '02'; endif
  if (mes_str = 'MAR'); return '03'; endif
  if (mes_str = 'APR'); return '04'; endif
  if (mes_str = 'MAY'); return '05'; endif
  if (mes_str = 'JUN'); return '06'; endif
  if (mes_str = 'JUL'); return '07'; endif
  if (mes_str = 'AUG'); return '08'; endif
  if (mes_str = 'SEP'); return '09'; endif
  if (mes_str = 'OCT'); return '10'; endif
  if (mes_str = 'NOV'); return '11'; endif
  if (mes_str = 'DEC'); return '12'; endif
  
############################################
### Definindo Variáveis. Mudar os        ### 
### diretorios das _paths_ abaixo        ###
############################################
#
#_path_dat='/home/aluno/matheus/atc2'
#_path_fig='figuras'
#_data=subwrd(args,1)
#_ano=substr(_data,1,4)
#_mes=substr(_data,5,2)
#_dia=substr(_data,7,2)
#_hora=substr(_data,9,2)
#
#'!mkdir -p '_path_fig
#_path_png=_path_fig'/'_ano%_mes%_dia%_hora
#'!mkdir -p '_path_png
#_path_desc=_path_dat

#_tipmod='draw string 6.7 .3 MODELO GLOBAL GFS0p50 - NCEP'
#_rsl='x1800 y2400'
#_rsl=' '
#
############################################
### Abre Arquivo descritor               ###
############################################
#
'open '_path_desc'/'_ano%_mes%_dia%_hora'/gfs_'_ano%_mes%_dia%_hora'.ctl'
say _path_desc'/'_ano%_mes%_dia%_hora'/gfs_'_ano%_mes%_dia%_hora'.ctl'
'set mpdset brmap_hires'
#
'run /usr/share/grads/define_colors.gs'
'set mpdset brmap_hires'
#'set lat -60 15'
#'set lon -90 -30'
'set lat -50 0' ;# Alterar área de análise
'set lon -80 -25'
'set t 1'
'q time'
anl=subwrd(result,3)
#
####################################
# Mapa de Temperatura a 2m 
####################################
#
#'set cint 3'
'set grads off'
'set gxout shaded'
'set clevs  -6  -3  0  3  6  9 12 15 18 21 24 27 30' 
'set ccols  49  48 46 44 43 42 41 21 22 23 24 26 28 29'
'd tmp2m-273.15'
'run /usr/share/grads/cbarn.gs'

# Lon Lat # Rio Bonito do Iguaçu (PR) #25° 29′ 27″ S, 52° 31′ 33″ O
#'q w2xy -52.31 -25.29' 
#say result
#xpos=subwrd(result,3)
#ypos=subwrd(result,6)
#'set line 9'
#'draw mark 9 'xpos' 'ypos' 0.15'
ret=marcador()

'draw title Analise de Temperatura (C) a 2m \ para 'anl
'draw xlab Fonte: Modelo GFS/NCEP'
'set strsiz 0.12 0.12'
'draw string 0.70 0.3 CTMET/IFSC'
'printim '_path_png'/anl_tsup_'_dia%_hora'.png white '_rsl
say _path_png'/anl_tsup_'_dia%_hora'.png'
pull c
#'quit'
#
####################################
# Mapa de UR em 850 hPa 
####################################
#
'c'
'set lev 850'
'set cint 10'
'set grads off'
'set clevs 40 50 60 70 75 80 85 90 95'
'set ccols 29 27 26 24 22 42 44 46 47 49'
'd rhprs'
'run /usr/share/grads/cbarn.gs'
ret=marcador()
'draw title Analise de Umidade Relativa (%) em 850 hPa \ para 'anl
'draw xlab Fonte: Modelo GFS/NCEP'
'set strsiz 0.12 0.12'
'draw string 0.70 0.3 CTMET/IFSC'
'printim '_path_png'/anl_umrl_850_'_dia%_hora'.png white '_rsl
say _path_png'/anl_umrl_850_'_dia%_hora'.png'
pull c
#
####################################
# Mapa de Vento em 200 hPa 
####################################
#
'c'
'set lev 200'
'set cmin 30'
'set grads off'
'set clevs 30 40 50 60 70'
'set ccols  0 72 74 76 78 79'
'd mag(ugrdprs,vgrdprs)'
'run /usr/share/grads/cbarn.gs'
ret=marcador()
'set gxout stream'
'set grads off'
'd ugrdprs;vgrdprs'
'draw title Analise de Vento (m/s) em 200 hPa \ para 'anl
'draw xlab Fonte: Modelo GFS/NCEP'
'set strsiz 0.12 0.12'
'draw string 0.70 0.3 CTMET/IFSC'
'printim '_path_png'/anl_jato_'_dia%_hora'.png white '_rsl
say _path_png'/anl_jato_'_dia%_hora'.png'
pull c
#
####################################
# Mapa de Vento em 500 hPa 
####################################
#
'c'
'set lev 500'
'set grads off'
'set clevs 12 15 18 21 24 27 30'
'set ccols  0 72 73 74 76 77 78 79'
'd mag(ugrdprs,vgrdprs)'
'run /usr/share/grads/cbarn.gs'
ret=marcador()
'set gxout stream'
'set grads off'
'd ugrdprs;vgrdprs'
'draw title Analise de Vento (m/s) em 500 hPa \ para 'anl
'draw xlab Fonte: Modelo GFS/NCEP'
'set strsiz 0.12 0.12'
'draw string 0.70 0.3 CTMET/IFSC'
'printim '_path_png'/anl_lcor_500_'_dia%_hora'.png white  '_rsl
say _path_png'/anl_lcor_500_'_dia%_hora'.png white  '_rsl
pull c
#
####################################
# Mapa de Vento em 850 hPa 
####################################
#
'c'
'set lev 850'
'set grads off'
'set clevs 12 15 18 21 24 27 30'
'set ccols  0 72 73 74 76 77 78 79'
'd mag(ugrdprs,vgrdprs)'
'run /usr/share/grads/cbarn.gs'
ret=marcador()
'set gxout stream'
'set grads off'
'd ugrdprs;vgrdprs'
'draw title Analise de Vento (m/s) em 850 hPa \ para 'anl
'draw xlab Fonte: Modelo GFS/NCEP'
'set strsiz 0.12 0.12'
'draw string 0.70 0.3 CTMET/IFSC'
'printim '_path_png'/anl_lcor_850_'_dia%_hora'.png white  '_rsl
say _path_png'/anl_lcor_850_'_dia%_hora'.png white  '_rsl
pull c
#
####################################
# Mapa de Vento em 1000 hPa 
####################################
#
'c'
'set lev 1000'
'set grads off'
'set clevs  8 10 12 14 16 18 20'
'set ccols  0 72 73 74 75 76 77 79'
'd mag(ugrdprs,vgrdprs)'
'run /usr/share/grads/cbarn.gs'
ret=marcador()
'set gxout stream'
'set grads off'
'd ugrdprs;vgrdprs'
'draw title Analise de Vento (m/s) em 1000 hPa \ para 'anl
'draw xlab Fonte: Modelo GFS/NCEP'
'set strsiz 0.12 0.12'
'draw string 0.70 0.3 CTMET/IFSC'
'printim '_path_png'/anl_lcor_1000_'_dia%_hora'.png white  '_rsl
say _path_png'/anl_lcor_1000_'_dia%_hora'.png white  '_rsl
pull c
#
####################################
# Mapa de CAPE (Shaded) e Lifted (Contorno) 
####################################
#
'c'
'set gxout shaded'
'set clevs 300 600 900 1200 1500 1800 2100 2400'
'set ccols   0  43  46   49   38   39   25   27  29'
'set grads off'
'd capesfc'
#'run /usr/share/grads/cbarn.gs 1.0 1 7.7 5.5'
'run /usr/share/grads/cbarn.gs'
ret=marcador()
'set gxout contour'
'set clevs -6 -5 -4 -3 -2 -1 0'
'set grads off'
'd lftxsfc'
'draw title Analise de Indices CAPE (J/Kg) e Lifted (K) em Superficie \ para 'anl
'draw xlab Fonte: Modelo GFS/NCEP'
'set strsiz 0.12 0.12'
'draw string 0.70 0.3 CTMET/IFSC'
'printim '_path_png'/anl_indices_'_dia%_hora'.png white  '_rsl
say _path_png'/anl_indices_'_dia%_hora'.png white  '_rsl
pull c
#
####################################
# Mapa de Omega (Shaded) e Alt. Geopotencial (Contorno) em 500 hPa 
####################################
#
'c'
'set lev 500'
'set gxout shaded'
'set clevs -0.7 -0.5 -0.3 -0.2 -0.1 -0.05 0.05 0.1 0.2 0.3 0.5 0.7'
#'set ccols   49   47   45   43   42    41   0  21   22  23  25  27  29'
'set ccols   39   37   35   33   32    31   0  71   72  73  75  77  79'
'set grads off';# Isso é para retirar a propaganda do grads
'd vvelprs'
#'run /usr/share/grads/cbarn.gs 1.0 1 7.7 5.5'
'run /usr/share/grads/cbarn.gs'
ret=marcador()
'set gxout contour'
'set cint 50'
'set grads off'
'd hgtprs'
'draw title Analise de Omega (Pa/s) e Alt. Geop (m) em 500 hPa \ para 'anl
'draw xlab Fonte: Modelo GFS/NCEP'
'set strsiz 0.12 0.12'
'draw string 0.70 0.3 CTMET/IFSC'
'printim '_path_png'/anl_omeg_500_'_dia%_hora'.png white  '_rsl
say _path_png'/anl_omeg_500_'_dia%_hora'.png white  '_rsl
pull c
#
####################################
# Mapa de Temperatura Maxima 
####################################
#
'c'
'set t 3'
'q time'
fct=subwrd(result,3)
'set clevs -4.0 -2.0 -1.5 -1.0 -0.7 -0.5 -0.2  0.2 0.5 0.7 1.0 1.5 2.0 4.0 '
'set ccols   49   48   47   45   43   42    41   0  21   22  23  25  27  28 29'
'set grads off'
'set gxout shaded'
'set clevs  -6  -3  0  3  6  9 12 15 18 21 24 27 30' 
'set ccols  49  48 46 44 43 42 41 21 22 23 24 26 28 29'
'd tmax2m-273.15'
'run /usr/share/grads/cbarn.gs'
ret=marcador()
'draw title Previsao (6h) de Temp. Maxima (C) a 2m \ para 'fct 
'draw xlab Fonte: Modelo GFS/NCEP'
'set strsiz 0.12 0.12'
'draw string 0.70 0.3 CTMET/IFSC'
'printim '_path_png'/anl_tmax_'_dia%_hora'.png white  '_rsl
say _path_png'/anl_tmax_'_dia%_hora'.png white  '_rsl
pull c
#
####################################
# Mapa de Vort. relativa (shaded) ae Altura Geop. (Contorno) em 1000 hPa 
####################################
#
'c'
'set strsiz 0.12 0.12'
'draw string 0.70 0.3 CTMET/IFSC'
'set t 1'
'set lev 1000'
'set gxout shaded'
'set clevs -4.0 -2.0 -1.5 -1.0 -0.7 -0.5 -0.2  0.2 0.5 0.7 1.0 1.5 2.0 4.0 '
'set ccols   49   48   47   45   43   42    41   0  21   22  23  25  27  28 29'
'set grads off';# Isso é para retirar a propaganda do grads
'd hcurl(ugrdprs,vgrdprs)*1e05'
#'run /usr/share/grads/cbarn.gs 1.0 1 7.8 5.5'
'run /usr/share/grads/cbarn.gs'
ret=marcador()
'set gxout contour'
'set cint 50'
'set grads off'
'd hgtprs'
'draw title Analise de Vort. Rel. (*1e05) (1/s) e Alt. Geop (m) \ em 1000 hPa para 'anl
'draw xlab Fonte: Modelo GFS/NCEP'
'set strsiz 0.12 0.12'
'draw string 0.70 0.3 CTMET/IFSC'
'printim '_path_png'/anl_vrel_1000_'_dia%_hora'.png white  '_rsl
say _path_png'/anl_vrel_1000_'_dia%_hora'.png white  '_rsl
pull c
#
##############################################################################
### Mapa de Advecção de Temperatura em 850 hPa                          ###
##############################################################################
#
'c'
'set lev 850'
'set gxout shaded'
'set grads off'
'dtx=cdiff(TMPprs,x)'
'dty=cdiff(TMPprs,y)'
'dx=cdiff(lon,x)*3.1416/180'
'dy=cdiff(lat,y)*3.1416/180'
'adt=-1*((UGRDprs*dtx/(dx*cos(lat*3.1416/180)))+(VGRDprs*dty/(dy)))/6.37e6'
'set clevs  -5 -4 -3 -2 -1.5 -1 -0.5 -0.2 0.2 0.5  1 1.5  2  3  4  5'
'set ccols  49 48 47 46   45 44   43   42   0  22 23  24 25 26 27 28 29'
'd adt*1e04'
#'run /usr/share/grads/cbarn.gs 1.0 1 7.8 5.5'
'run /usr/share/grads/cbarn.gs'
ret=marcador()
'set gxout contour'
'set clab off'
'set ccolor 15'
'set clevs  -5 -4 -3 -2 -1.5 -1 -0.5 -0.2 0.2 0.5  1 1.5  2  3  4  5'
'd adt*1e04'
'set clab on'
'draw title Analise de Advec. de temperatura (*1E04) (K/s) \ em 850 hPa para 'anl
'draw xlab Fonte: Modelo GFS/NCEP'
'set strsiz 0.12 0.12'
'draw string 0.70 0.3 CTMET/IFSC'
'printim '_path_png'/anl_advt_850_'_dia%_hora'.png white  '_rsl
say _path_png'/anl_advt_850_'_dia%_hora'.png white  '_rsl
pull c
#
##############################################################################
### Mapa de Advecção de vorticidade relativa em 500hPa                     ###
##############################################################################
#
'c'
'set lev 500'
'set gxout shaded'
'set grads off'
'dtx=cdiff(hcurl(UGRDprs,VGRDprs),x)'
'dty=cdiff(hcurl(UGRDprs,VGRDprs),y)'
'dx=cdiff(lon,x)*3.1416/180'
'dy=cdiff(lat,y)*3.1416/180'
'adv=-1*((UGRDprs*dtx/(dx*cos(lat*3.1416/180)))+(VGRDprs*dty/(dy)))/6.37e6'
'set clevs  -6 -5 -4 -3 -2 -1.5 -1 -0.5 0.5  1 1.5  2  3  4  5  6'
'set ccols  49 48 47 46 45   44 43   42   0 22  23 24 25 26 27 28 29'
'd adv*1e09'
#'run /usr/share/grads/cbarn.gs 1.0 1 7.8 5.5'
'run /usr/share/grads/cbarn.gs'
ret=marcador()
'set gxout contour'
'set cint 50'
'set grads off'
'd HGTprs'
'draw title Analise de Advec. de Vort. Rel(*1E09) (1/s) e Alt. Geop \ em 500 hPa para 'anl
'draw xlab Fonte: Modelo GFS/NCEP'
'set strsiz 0.12 0.12'
'draw string 0.70 0.3 CTMET/IFSC'
'printim '_path_png'/anl_advv_500_'_dia%_hora'.png white  '_rsl
say _path_png'/anl_advv_500_'_dia%_hora'.png white  '_rsl
pull c
#
##############################################################################
### Mapa de Espessura (1000-500), PRNMM e Vento a 10m                      ###
##############################################################################
#
'c'
'set gxout shaded'
'set grads off'
'set clevs 5250 5300 5350 5400 5450 5500 5550 5600 5650 5700 5750 5800 5850'
'set ccols   49   48   47   46   45   44   43   42   22   23   25   27   28  29'
'd hgtprs(lev=500)-hgtprs(lev=1000)'
#'run /usr/share/grads/cbarn.gs 1.0 1 7.8 5.5'
'run /usr/share/grads/cbarn.gs'
ret=marcador()
'set gxout contour'
'set cint 4'
'set grads off'
'd PRMSLmsl/100'
'set gxout vector'
'set grads off'
'set ccolor 1'
'd skip(ugrd10m,2);vgrd10m'
'draw title Analise de Espessura da Camda (1000-500 hPa) (m) \ PRNMM (hPa) e Vento a 10m (m/s) para 'anl
'draw xlab Fonte: Modelo GFS/NCEP'
'set strsiz 0.12 0.12'
'draw string 0.70 0.3 CTMET/IFSC'
'printim '_path_png'/anl_pres_'_dia%_hora'.png white  '_rsl
say _path_png'/anl_pres_'_dia%_hora'.png white  '_rsl
pull c  
#
##############################################################################
### Mapa de Radiacao Global a Superficie (W/m2)                                         ###
##############################################################################
#
'c'
'set t 3'
'q time'
fct=subwrd(result,3)
'set gxout shaded'
'set grads off'
'set rgb 71  20  20  20'
'set rgb 72  40  40  40'
'set rgb 73  60  60  60'
'set rgb 74  80  80  80'
'set rgb 75 100 100 100'
'set rgb 76 120 120 120'
'set rgb 77 140 140 140'
'set rgb 78 160 160 160'
'set rgb 79 180 180 180'
'set rgb 80 200 200 200'
'set rgb 81 220 220 220'
'set rgb 82 240 240 240'
'set map 7'
#
'set ccols   1  71  72  73  74  75  76  77  78  79  80  81  82 0'
'set clevs  10  20  30  40  60  80  85  87  89  91  93  96  99'
'd TCDCl10'
'set gxout contour'
'set clevs 200 400 600 800 1000 1200'
'set ccolor 6'
'd DLWRFsfc+DSWRFsfc'
#'run /usr/share/grads/cbarn.gs 1.0 1 7.8 5.5'
'run /usr/share/grads/cbarn.gs'
ret=marcador()
'draw title Previsao (6h) de Cobertura de Nuvens (%) \Radiacao Global (W/m2) a Superficie  para 'fct 
'draw xlab Fonte: Modelo GFS/NCEP'
'set strsiz 0.12 0.12'
'draw string 0.70 0.3 CTMET/IFSC'
'printim '_path_png'/anl_radglo_'_dia%_hora'.png white  '_rsl
say _path_png'/anl_radglo_'_dia%_hora'.png white  '_rsl
pull c
#
##############################################################################
### Mapa de Altura Geop. em 500 hPa na projecao South polar stereographic   ###
##############################################################################
#
'c'
'set gxout shaded'
'set t 1'
'set map 1'
'set lev 500'
'set lat -90 -20'
'set lon -240 120'
'set mproj sps'
'set grads off'
'set cmax 5700'
'd hgtprs'
'run /usr/share/grads/cbarn.gs'
ret=marcador()
'set gxout contour'
'set clevs 5200'
'set cthick 6'
'd hgtprs'
'draw title Analise de Altura Geopotencial (m) em 500 hPa \  para 'anl 
'draw xlab Fonte: Modelo GFS/NCEP'
'set strsiz 0.12 0.12'
'draw string 0.70 0.3 CTMET/IFSC'
'printim '_path_png'/geop500.png white'
'printim '_path_png'/anl_geop500_'_dia%_hora'.png white  '_rsl
say _path_png'/anl_geop500_'_dia%_hora'.png white  '_rsl
pull c
#
##############################################################################
###                               FIM                                      ###
##############################################################################
#
say "==============================================="
say "|         ENVIANDO FIGURAS PRA PAGINA!        |"
say "==============================================="
#'!scp '_path_png'/*.png meteoro@172.16.128.48:/opt/lampp/htdocs/webmeteoro_ifsc/atc/pub/modelos/gfs'
say "==============================================="
say "|                    FIM!                     |"
say "==============================================="
'quit'







# Lon Lat # Rio Bonito do Iguaçu (PR) #25° 29′ 27″ S, 52° 31′ 33″ O
function marcador()
'q w2xy -52.31 -25.29' 
say result
xpos=subwrd(result,3)
ypos=subwrd(result,6)
'set line 9'
'draw mark 9 'xpos' 'ypos' 0.15'
return 'ok'
















