import { CommonModule } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { Ticket } from '../../../models/interfaces/ticket.model';
import {
  ActualizarTicketMemoria,
  TicketWorkflowMemoryRecord,
} from '../../../models/interfaces/ticket-workflow.model';
import {
  KnowledgeMapMode,
  KnowledgeMapNode,
  KnowledgeMapNodeStatus,
  KnowledgeMapNodeType,
  TicketKnowledgeMap,
} from '../../../models/interfaces/ticket-knowledge-map.model';

interface KnowledgeFlowStep {
  node: KnowledgeMapNode;
  connector?: string;
}

@Component({
  selector: 'app-ticket-knowledge-map',
  imports: [CommonModule],
  templateUrl: './ticket-knowledge-map.html',
  styleUrl: './ticket-knowledge-map.css',
})
export class TicketKnowledgeMapComponent {
  ticket = input.required<Ticket>();
  memory = input<TicketWorkflowMemoryRecord | null>(null);

  public readonly nodeWidth = 250;
  public readonly nodeHeight = 128;
  public mode = signal<KnowledgeMapMode>('mind');
  public mindMap = computed(() => this.buildMindMap());
  public flowSteps = computed<KnowledgeFlowStep[]>(() => {
    const flow = this.buildFlowMap();

    return flow.nodes.map((node, index) => ({
      node,
      connector: flow.edges[index]?.label,
    }));
  });

  setMode(mode: KnowledgeMapMode): void {
    this.mode.set(mode);
  }

  nodeClass(node: KnowledgeMapNode): string {
    const byType: Record<KnowledgeMapNodeType, string> = {
      ticket: 'node-ticket',
      problem: 'node-problem',
      symptom: 'node-info',
      cause: 'node-risk',
      solution: 'node-success',
      validation: 'node-info',
      knowledge: 'node-knowledge',
      commit: 'node-info',
      state: 'node-state',
      assignment: 'node-info',
    };

    return `${byType[node.type]} ${this.statusClass(node.status)}`;
  }

  edgePath(sourceId: string, targetId: string): string {
    const source = this.mindMap().nodes.find((node) => node.id === sourceId);
    const target = this.mindMap().nodes.find((node) => node.id === targetId);
    if (!source || !target) return '';

    const sourceCenterX = source.x + this.nodeWidth / 2;
    const sourceCenterY = source.y + this.nodeHeight / 2;
    const targetCenterX = target.x + this.nodeWidth / 2;
    const targetCenterY = target.y + this.nodeHeight / 2;
    const isHorizontal = Math.abs(targetCenterX - sourceCenterX) >= Math.abs(targetCenterY - sourceCenterY);

    if (isHorizontal) {
      const sourceX = sourceCenterX <= targetCenterX ? source.x + this.nodeWidth : source.x;
      const targetX = sourceCenterX <= targetCenterX ? target.x : target.x + this.nodeWidth;
      const midX = (sourceX + targetX) / 2;
      return `M ${sourceX} ${sourceCenterY} C ${midX} ${sourceCenterY}, ${midX} ${targetCenterY}, ${targetX} ${targetCenterY}`;
    }

    const sourceY = sourceCenterY <= targetCenterY ? source.y + this.nodeHeight : source.y;
    const targetY = sourceCenterY <= targetCenterY ? target.y : target.y + this.nodeHeight;
    const midY = (sourceY + targetY) / 2;
    return `M ${sourceCenterX} ${sourceY} C ${sourceCenterX} ${midY}, ${targetCenterX} ${midY}, ${targetCenterX} ${targetY}`;
  }

  edgeLabelX(sourceId: string, targetId: string): number {
    const source = this.mindMap().nodes.find((node) => node.id === sourceId);
    const target = this.mindMap().nodes.find((node) => node.id === targetId);
    if (!source || !target) return 0;
    return (source.x + target.x + this.nodeWidth) / 2;
  }

  edgeLabelY(sourceId: string, targetId: string): number {
    const source = this.mindMap().nodes.find((node) => node.id === sourceId);
    const target = this.mindMap().nodes.find((node) => node.id === targetId);
    if (!source || !target) return 0;
    return (source.y + target.y + this.nodeHeight) / 2 - 8;
  }

  trackNode(index: number, node: KnowledgeMapNode): string {
    return node.id || `node-${index}`;
  }

  trackEdge(index: number): string {
    return `edge-${index}`;
  }

  statusLabel(status: KnowledgeMapNodeStatus): string {
    const labels: Record<KnowledgeMapNodeStatus, string> = {
      complete: 'Completo',
      pending: 'Pendiente',
      risk: 'Riesgo',
      info: 'Info',
    };

    return labels[status];
  }

  private buildMindMap(): TicketKnowledgeMap {
    const ticket = this.ticket();
    const memory = this.memory();
    const latest = this.getConsolidatedUpdate(memory);

    const hasCause = Boolean((latest?.causaRaiz ?? ticket.causaRaiz)?.trim());
    const hasSolution = Boolean((latest?.solucionAplicada ?? latest?.solucionPropuesta ?? ticket.solucionPropuesta)?.trim());
    const hasKnowledge = Boolean(latest?.resumenConocimiento?.trim());
    const hasValidation = Boolean(latest?.idResultadoValidacion || latest?.observacionesQa?.trim());

    return {
      mode: 'mind',
      nodes: [
        this.node('problem', '1. Problema recibido', ticket.descripcion, 'problem', 'info', 72, 160),
        this.node('symptom', '2. Evidencia observable', latest?.sintomaConfirmado ?? 'Pendiente de documentar', 'symptom', latest?.sintomaConfirmado ? 'complete' : 'pending', 72, 360),
        this.node('cause', '3. Causa raiz', latest?.causaRaiz ?? ticket.causaRaiz ?? 'Pendiente de diagnostico', 'cause', hasCause ? 'complete' : 'risk', 437, 260),
        this.node('solution', '4. Solucion aplicada', latest?.solucionAplicada ?? latest?.solucionPropuesta ?? ticket.solucionPropuesta ?? 'Pendiente de plan tecnico', 'solution', hasSolution ? 'complete' : 'pending', 804, 160),
        this.node('validation', '5. Validacion', latest?.observacionesQa ?? 'Sin validacion registrada', 'validation', hasValidation ? 'complete' : 'pending', 804, 360),
        this.node('knowledge', '6. Aprendizaje reutilizable', latest?.resumenConocimiento ?? latest?.recomendacionFutura ?? 'Aun no documentado', 'knowledge', hasKnowledge ? 'complete' : 'pending', 1170, 260),
      ],
      edges: [
        { source: 'problem', target: 'cause', label: 'se analiza' },
        { source: 'symptom', target: 'cause', label: 'evidencia' },
        { source: 'cause', target: 'solution', label: 'define accion' },
        { source: 'solution', target: 'validation', label: 'se prueba' },
        { source: 'validation', target: 'knowledge', label: 'se documenta' },
        { source: 'cause', target: 'knowledge', label: 'aprendizaje' },
      ],
    };
  }

  private buildFlowMap(): TicketKnowledgeMap {
    const ticket = this.ticket();
    const memory = this.memory();
    const latest = this.getConsolidatedUpdate(memory);

    const hasCause = Boolean((latest?.causaRaiz ?? ticket.causaRaiz)?.trim());
    const hasSolution = Boolean((latest?.solucionAplicada ?? latest?.solucionPropuesta ?? ticket.solucionPropuesta)?.trim());
    const hasCommit = Boolean(latest?.commitId?.trim() || latest?.pullRequestUrl?.trim());
    const hasValidation = Boolean(latest?.idResultadoValidacion || latest?.observacionesQa?.trim());
    const hasKnowledge = Boolean(latest?.resumenConocimiento?.trim());

    return {
      mode: 'flow',
      nodes: [
        this.node('received', '1. Recepcion', ticket.codigoCaso, 'ticket', 'complete', 36, 186),
        this.node('state', '2. Estado', ticket.estadoActual, 'state', 'info', 216, 186),
        this.node('diagnosis', '3. Diagnostico', hasCause ? 'Causa raiz documentada' : 'Pendiente de causa raiz', 'cause', hasCause ? 'complete' : 'risk', 396, 186),
        this.node('solution', '4. Implementacion', hasSolution ? 'Plan tecnico definido' : 'Pendiente de solucion', 'solution', hasSolution ? 'complete' : 'pending', 576, 186),
        this.node('commit', '5. Evidencia Git', latest?.commitId ?? latest?.pullRequestUrl ?? 'Sin PR/commit', 'commit', hasCommit ? 'complete' : 'pending', 756, 186),
        this.node('validation', '6. Validacion', hasValidation ? 'Resultado registrado' : 'Pendiente de validacion', 'validation', hasValidation ? 'complete' : 'pending', 936, 186),
        this.node('knowledge', '7. Conocimiento', hasKnowledge ? 'Leccion documentada' : 'Pendiente de documentar', 'knowledge', hasKnowledge ? 'complete' : 'pending', 1116, 186),
      ],
      edges: [
        { source: 'received', target: 'state', label: 'clasifica' },
        { source: 'state', target: 'diagnosis', label: 'investiga' },
        { source: 'diagnosis', target: 'solution', label: 'resuelve' },
        { source: 'solution', target: 'commit', label: 'traza' },
        { source: 'commit', target: 'validation', label: 'valida' },
        { source: 'validation', target: 'knowledge', label: 'capitaliza' },
      ],
    };
  }

  private node(
    id: string,
    label: string,
    detail: string | undefined,
    type: KnowledgeMapNodeType,
    status: KnowledgeMapNodeStatus,
    x: number,
    y: number,
  ): KnowledgeMapNode {
    return {
      id,
      label,
      detail: this.normalizeDetail(detail),
      type,
      status,
      x,
      y,
    };
  }

  private statusClass(status: KnowledgeMapNodeStatus): string {
    const statuses: Record<KnowledgeMapNodeStatus, string> = {
      complete: 'status-complete',
      pending: 'status-pending',
      risk: 'status-risk',
      info: 'status-info',
    };

    return statuses[status];
  }

  private getConsolidatedUpdate(memory: TicketWorkflowMemoryRecord | null): ActualizarTicketMemoria | null {
    if (!memory?.actualizaciones.length) return null;

    return memory.actualizaciones.reduce<ActualizarTicketMemoria>(
      (acumulado, actualizacion) => ({
        ...acumulado,
        ...actualizacion,
        fechaActualizacion: actualizacion.fechaActualizacion,
        paso: actualizacion.paso,
      }),
      {
        fechaActualizacion: new Date().toISOString(),
        paso: 'definicion',
      },
    );
  }

  private normalizeDetail(value: string | undefined): string {
    return value?.trim() || 'Sin informacion';
  }
}
