{{/*
Nom complet du service : release-name
*/}}
{{- define "restaurant-service.fullname" -}}
{{- if .Values.name }}
{{- .Values.name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}

{{- define "restaurant-service.statefulsetname" -}}
{{- $name := include "restaurant-service.fullname" . -}}
{{- printf "postgre%s" (substr 7 -1 $name) -}}
{{- end }}

{{/*
Labels Kubernetes standards
*/}}
{{- define "restaurant-service.labels" -}}
{{- with .Values.labels }}
{{ toYaml . }}
{{- end }}
{{- end }}

{{/*
Selector labels (sous-ensemble stable pour matchLabels)
*/}}
{{- define "restaurant-service.selectorLabels" -}}
app: {{ .Values.name }}
{{- end }}
