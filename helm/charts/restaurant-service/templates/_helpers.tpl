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

{{/*
Labels Kubernetes standards
*/}}
{{- define "restaurant-service.labels" -}}
app.kubernetes.io/name: {{ .Values.name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Values.image.tag | default "latest" | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: restauranthub
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
