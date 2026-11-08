#!/usr/bin/env bash
# Crea los trabajos programados de los agentes de Musashi en Hermes.
# Requiere: hermes instalado, skills copiadas a ~/.hermes/skills/musashi/, gateway corriendo.
set -e

hermes cron create "every 2h" "Eres el agente Perfilador de Ronin Studio. Sigue la skill musashi-perfilador de principio a fin y deja tus propuestas en Musashi." --skill musashi-base --skill musashi-perfilador --name "Musashi · Perfilador" --timezone America/Ciudad_Juarez --deliver local
hermes cron create "weekdays at 8am" "Eres el agente Seguimiento de Ronin Studio. Sigue la skill musashi-seguimiento de principio a fin y deja tus propuestas en Musashi." --skill musashi-base --skill musashi-seguimiento --name "Musashi · Seguimiento" --timezone America/Ciudad_Juarez --deliver local
hermes cron create "every monday 9am" "Eres el agente Reportero de Ronin Studio. Sigue la skill musashi-reportero de principio a fin y deja tus propuestas en Musashi." --skill musashi-base --skill musashi-reportero --name "Musashi · Reportero" --timezone America/Ciudad_Juarez --deliver local
hermes cron create "daily at 7:30am" "Eres el agente Cobrador de Ronin Studio. Sigue la skill musashi-cobrador de principio a fin y deja tus propuestas en Musashi." --skill musashi-base --skill musashi-cobrador --name "Musashi · Cobrador" --timezone America/Ciudad_Juarez --deliver local
hermes cron create "every friday 6pm" "Eres el agente Analista de Ronin Studio. Sigue la skill musashi-analista de principio a fin y deja tus propuestas en Musashi." --skill musashi-base --skill musashi-analista --name "Musashi · Analista" --timezone America/Ciudad_Juarez --deliver local
hermes cron create "every friday 7am" "Eres el agente Investigador de Ronin Studio. Sigue la skill musashi-investigador de principio a fin y deja tus propuestas en Musashi." --skill musashi-base --skill musashi-investigador --name "Musashi · Investigador" --timezone America/Ciudad_Juarez --deliver local
hermes cron create "every friday 12pm" "Eres el agente Estratega de Ronin Studio. Sigue la skill musashi-estratega de principio a fin y deja tus propuestas en Musashi." --skill musashi-base --skill musashi-estratega --name "Musashi · Estratega" --timezone America/Ciudad_Juarez --deliver local
hermes cron create "weekdays at 10am" "Eres el agente Guionista de Ronin Studio. Sigue la skill musashi-guionista de principio a fin y deja tus propuestas en Musashi." --skill musashi-base --skill musashi-guionista --name "Musashi · Guionista" --timezone America/Ciudad_Juarez --deliver local
hermes cron create "every 30m" "Eres el agente Publicador de Ronin Studio. Sigue la skill musashi-publicador de principio a fin y deja tus propuestas en Musashi." --skill musashi-base --skill musashi-publicador --name "Musashi · Publicador" --timezone America/Ciudad_Juarez --deliver local
hermes cron create "every monday 8am" "Eres el agente Analista de canal de Ronin Studio. Sigue la skill musashi-analista-canal de principio a fin y deja tus propuestas en Musashi." --skill musashi-base --skill musashi-analista-canal --name "Musashi · Analista de canal" --timezone America/Ciudad_Juarez --deliver local

hermes cron list
