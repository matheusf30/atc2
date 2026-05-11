#!/bin/bash
#
######################################################################
### ESTE SCRIPT PEGA DADOS DO IFSC NA PALMA DA MÃO                 ###
### Exercício de Aula de Análise de Tempo e Clima 2                ### 
###                                                                ### 
### CTMET/IFSC                                                     ###
###                                                                ### 
###                                                                ### 
### Elaborado:          MARIO QUADRO          	   -FEB, 26th 2023 ###
### Adaptado:           MATHEUS FERREIRA DE SOUZA  -MAR, 02nd 2026 ###
######################################################################

### Verificação de Argumento Repassado
if [ -z "$1" ]; then
    echo "Data deve ser utilizada assim: $0 YYYYMMDDHH"
    echo "Verificação: $0 $1"
    exit 1
fi

### Primeira Variável como Argumento Íntegro
DATA_ALVO=$1 #AAAAMMDD

### Extração de ANO e MÊS (Primeiros 6 Dígitos) do Argumento Íntegro
ANO=${DATA_ALVO:0:4}
ANO_MES=${DATA_ALVO:0:6}

######################################################################
### ESTE SCRIPT PEGA DADOS DO IFSC NA PALMA DA MÃO E DO CLUSTER    ###
######################################################################

scp -r "meteoro@172.16.0.110:/media/produtos/atc/${ANO_MES}/${DATA_ALVO}" .

scp -r "meteoro@172.16.0.110:/media/produtos/sst/${ANO_MES}" "/${DATA_ALVO}" .
 
scp -r "meteoro@172.16.0.110:/media/produtos/opera_prevclima/${ANO_MES}" "/${DATA_ALVO}" .
 
scp -r "meteoro@172.16.0.110:/media/produtos/samet/monthly/${ANO}" "/${DATA_ALVO}" .
  
scp -r "meteoro@172.16.0.110:/media/produtos/merge/monthly/${ANO}" "/${DATA_ALVO}" .

