#!/bin/bash

# Define the URL
URL="http://localhost:3000/pdf"

# Define the JSON data
DATA='{
    "user": {
        "name": "Levy",
        "email": "lev0x79@gmail.com",
        "phoneNumber": "94981362600"
    },
    "questions": {
        "As áreas afetadas são dolorosas? (0 não / 10 muito)": 8,
        "As áreas afetadas são sensíveis ao toque ou à pressão? (0 não / 10 muito)": 6,
        "Você tende a ter manchas roxas facilmente e frequentes nas pernas? (Hematomas, equimoses) (0 não / 10 muito)": 4,
        "Você sente 'pressão' ou 'tensão' nas pernas? (0 não / 10 muito)": 7,
        "Sente as pernas 'quentes' ou sensação de 'queimação'? (0 não / 10 muito)": 3,
        "Sente suas pernas frias? (0 não / 10 muito)": 2,
        "Tem câimbras musculares? (0 não / 10 muito frequente)": 5,
        "Sente peso nas pernas? (0 não / 10 muito)": 6,
        "Sente cansaço nas pernas? (0 não / 10 muito)": 10,
        "Sente inchaço nas pernas? (0 não / 10 muito)": 5,
        "Tem 'irritações' na pele? (0 não / 10 muita)": 3,
        "Sente coceira? (0 não / 10 muita)": 2,
        "Tem dificuldade para caminhar, limitação de movimento? (0 não / 10 gravemente)": 4,
        "Como a condição afeta sua qualidade de vida? (0 nada / 10 gravemente)": 10,
        "Está satisfeita com a aparência das pernas? (0 muito satisfeita / 10 insatisfeita)": 10
    }
}'

# Send 20 POST requests
for i in {1..20}
do
    echo "Sending request $i"
    curl -X POST -H "Content-Type: application/json" -d "$DATA" "$URL"
    echo "Request $i completed"
done
