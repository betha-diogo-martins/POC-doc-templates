/**
 * Shared HTML template used as initial content for both editors.
 * Contains header, body with merge fields, and footer.
 */

export const DOCUMENT_TEMPLATE = `
<div style="border-bottom: 2px solid #1a5276; padding-bottom: 16px; margin-bottom: 24px;">
  <h1 style="color: #1a5276; margin: 0; font-size: 24px;">{{empresa}}</h1>
  <p style="color: #666; margin: 4px 0 0 0; font-size: 12px;">CNPJ: {{cnpj}}</p>
</div>

<p style="text-align: right; color: #888; font-size: 12px;">
  Data: {{data}} &nbsp;|&nbsp; Documento: {{numero_documento}}
</p>

<h2 style="color: #2c3e50;">Declaração</h2>

<p>
  Declaramos para os devidos fins que <strong>{{nome}}</strong>,
  ocupante do cargo de <strong>{{cargo}}</strong> no departamento de
  <strong>{{departamento}}</strong>, é colaborador(a) desta empresa.
</p>

<p>
  Para contato, utilize o e-mail: <strong>{{email}}</strong>.
</p>

<p>
  Este documento foi gerado automaticamente e não necessita de assinatura física.
</p>

<br/>

<div style="border-top: 2px solid #1a5276; padding-top: 12px; margin-top: 40px; text-align: center;">
  <p style="color: #888; font-size: 11px; margin: 0;">
    {{empresa}} — Todos os direitos reservados<br/>
    Documento gerado em {{data}}
  </p>
</div>
`;
