from flask import Blueprint, jsonify, request

guidance_bp = Blueprint('guidance', __name__)

GUIDANCE = {
    'en': [
        {
            'id': 'emergency',
            'title': 'What to Do in an Emergency',
            'icon': '🚨',
            'steps': [
                'Call 911 immediately if there is immediate danger to life.',
                'Move to a safe location if you can do so without risk.',
                'Alert others around you calmly.',
                'Document the situation as soon as it is safe to do so.',
                'Contact your organization\'s safety officer or HR after the immediate emergency.',
            ],
        },
        {
            'id': 'document',
            'title': 'How to Document Safely',
            'icon': '📝',
            'steps': [
                'Write down dates, times, locations, and names of witnesses immediately.',
                'Use VigilSafe\'s anonymous mode if you are concerned about retaliation.',
                'Take photos only when it is safe — never put yourself at risk for evidence.',
                'Keep copies of any written communications (emails, texts, notes).',
                'Report through official channels in addition to VigilSafe when possible.',
            ],
        },
        {
            'id': 'personal_risk',
            'title': 'How to Avoid Personal Risk',
            'icon': '🛡️',
            'steps': [
                'Never confront a harasser or aggressor alone.',
                'Use the anonymous reporting option to protect your identity.',
                'Avoid sharing personally identifying details in your report description.',
                'If you feel unsafe at work or school, contact a trusted supervisor or counselor.',
                'Know your rights — retaliation for reporting safety concerns is illegal in most jurisdictions.',
            ],
        },
        {
            'id': 'resources',
            'title': 'Helpful Resources',
            'icon': '📞',
            'steps': [
                'National Domestic Violence Hotline: 1-800-799-7233',
                'OSHA (workplace safety): 1-800-321-OSHA (6742)',
                'Crisis Text Line: Text HOME to 741741',
                'EEOC (workplace discrimination): 1-800-669-4000',
                'SAMHSA Mental Health Hotline: 1-800-662-4357',
            ],
        },
    ],
    'es': [
        {
            'id': 'emergency',
            'title': 'Qué Hacer en una Emergencia',
            'icon': '🚨',
            'steps': [
                'Llama al 911 inmediatamente si hay peligro inmediato para la vida.',
                'Muévete a un lugar seguro si puedes hacerlo sin riesgo.',
                'Alerta a los demás a tu alrededor con calma.',
                'Documenta la situación tan pronto como sea seguro hacerlo.',
                'Contacta al oficial de seguridad o recursos humanos de tu organización después de la emergencia.',
            ],
        },
        {
            'id': 'document',
            'title': 'Cómo Documentar con Seguridad',
            'icon': '📝',
            'steps': [
                'Escribe fechas, horas, lugares y nombres de testigos inmediatamente.',
                'Usa el modo anónimo de VigilSafe si te preocupa la represalia.',
                'Toma fotos solo cuando sea seguro — nunca te pongas en riesgo por evidencia.',
                'Guarda copias de cualquier comunicación escrita (correos, mensajes, notas).',
                'Reporta también por canales oficiales cuando sea posible.',
            ],
        },
        {
            'id': 'personal_risk',
            'title': 'Cómo Evitar Riesgos Personales',
            'icon': '🛡️',
            'steps': [
                'Nunca confrontes solo a un acosador o agresor.',
                'Usa la opción de reporte anónimo para proteger tu identidad.',
                'Evita compartir detalles de identificación personal en la descripción de tu reporte.',
                'Si te sientes inseguro en el trabajo o la escuela, contacta a un supervisor o consejero de confianza.',
                'Conoce tus derechos — las represalias por reportar problemas de seguridad son ilegales en la mayoría de jurisdicciones.',
            ],
        },
        {
            'id': 'resources',
            'title': 'Recursos de Ayuda',
            'icon': '📞',
            'steps': [
                'Línea Nacional de Violencia Doméstica: 1-800-799-7233',
                'OSHA (seguridad laboral): 1-800-321-OSHA (6742)',
                'Línea de Crisis por Texto: Envía HOLA al 741741',
                'EEOC (discriminación laboral): 1-800-669-4000',
                'Línea de Salud Mental SAMHSA: 1-800-662-4357',
            ],
        },
    ],
}


@guidance_bp.route('/', methods=['GET'])
def get_guidance():
    lang = request.args.get('lang', 'en')
    if lang not in GUIDANCE:
        lang = 'en'
    return jsonify(GUIDANCE[lang])
