import { createId } from "@paralleldrive/cuid2";
import toposort from "toposort";
import type { Connection, Node } from "@/generated/prisma/client";
import { inngest } from "./client";

export const topologicalSort = (
  nodes: Node[],
  connections: Connection[],
): Node[] => {
  /**
   * 노드들
   *
   * nodes = [
   *   { id: "node-1", name: "트리거", type: "MAMUAL_TRIGGER" },
   *   { id: "node-2", name: "HTTP 요청", type: "HTTP_REQUEST" },
   *   { id: "node-3", name: "데이터 처리", type: "HTTP_REQUEST" },
   *   { id: "node-4", name: "독립 노드", type: "HTTP_REQUEST" }
   * ]
   *
   * 연결들
   * connections = [
   *   { fromNodeId: "node-1", toNodeId: "node-2" },  // 트리거 → HTTP 요청
   *   { fromNodeId: "node-2", toNodeId: "node-3" }   // HTTP 요청 → 데이터 처리
   * ]
   */

  /**
   * 연결이 없다면 노드들을 그대로 반환
   *   connections = []
   *   ↓ 노드들을 그대로 반환 ↓
   *   nodes = [
   *     { id: "node-1", name: "트리거", type: "MAMUAL_TRIGGER" },
   *     { id: "node-2", name: "HTTP 요청", type: "HTTP_REQUEST" },
   *     { id: "node-3", name: "데이터 처리", type: "HTTP_REQUEST" },
   *     { id: "node-4", name: "독립 노드", type: "HTTP_REQUEST" }
   *   ]
   */
  if (connections.length === 0) {
    return nodes;
  }

  /**
   * 각 연결을 [출발 노드 ID, 도착 노드 ID] 형태의 간선 배열로 변환
   *   connections = [
   *     { fromNodeId: "node-1", toNodeId: "node-2" },
   *     { fromNodeId: "node-2", toNodeId: "node-3" }
   *   ]
   *   ↓ map 변환 ↓
   *   edges = [
   *     ["node-1", "node-2"],  // node-1이 node-2보다 먼저 실행되어야 함
   *     ["node-2", "node-3"]   // node-2가 node-3보다 먼저 실행되어야 함
   *   ]
   */
  const edges: [string, string][] = connections.map((connection) => [
    connection.fromNodeId,
    connection.toNodeId,
  ]);

  /**
   * 연결된 노드들을 찾아서 세트에 추가(Set은 중복을 허용하지 않는 자료구조)
   *   connections = [
   *     { fromNodeId: "node-1", toNodeId: "node-2" },
   *     { fromNodeId: "node-2", toNodeId: "node-3" }
   *   ]
   *   ↓ Set 변환 ↓
   *   connectedNodes = Set { "node-1", "node-2", "node-3" }
   */
  const connectedNodes = new Set<string>();
  for (const connection of connections) {
    connectedNodes.add(connection.fromNodeId);
    connectedNodes.add(connection.toNodeId);
  }

  /**
   * 연결되지 않은 노드들을 찾아서 간선 배열에 추가
   * node-4는 다른 노드와 연결되지 않아 정렬에서 누락될 수 있음
   * 이를 방지하기 위해 간선 배열에 자기 자신으로의 간선을 추가
   *   connectedNodes = Set { "node-1", "node-2", "node-3" }
   *   ↓ 연결되지 않은 노드들을 찾아서 간선 배열에 추가 ↓
   *   edges = [
   *     ["node-1", "node-2"],
   *     ["node-2", "node-3"]
   *     ["node-4", "node-4"]
   *   ]
   */
  for (const node of nodes) {
    if (!connectedNodes.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }

  /**
   * edges = [
   *   ["node-1", "node-2"],
   *   ["node-2", "node-3"],
   *   ["node-4", "node-4"]
   * ]
   * ↓ toposort 실행(분석) ↓
   * 1. node-1은 의존성이 없음 → 먼저 실행 가능
   * 2. node-2는 node-1 이후에 실행
   * 3. node-3는 node-2 이후에 실행
   * 4. node-4는 독립적이므로 어디든 가능
   * ↓ 결과 ↓
   * sortedNodeIds = ["node-1", "node-2", "node-3", "node-4"]
   * 또는
   * sortedNodeIds = ["node-1", "node-2", "node-4", "node-3"] // node-4 위치는 유연
   */
  let sortedNodeIds: string[] = [];
  try {
    sortedNodeIds = toposort(edges); // 간선 정보를 분석해 의존성 순서를 결정, 예: ["A", "B"]는 "A가 B보다 먼저"를 의미
    sortedNodeIds = [...new Set(sortedNodeIds)]; // toposort 결과에 중복이 생길 수 있으므로 중복을 제거 후 배열로 변환
  } catch (error) {
    if (error instanceof Error && error.message.includes("Cyclic")) {
      throw new Error("Workflow contains a cycle");
    }
    throw error;
  }

  /**
   * 노드 맵 생성
   *   nodes = [
   *     { id: "node-1", name: "트리거", type: "MAMUAL_TRIGGER" },
   *     { id: "node-2", name: "HTTP 요청", type: "HTTP_REQUEST" },
   *     { id: "node-3", name: "데이터 처리", type: "HTTP_REQUEST" },
   *     { id: "node-4", name: "독립 노드", type: "HTTP_REQUEST" }
   *   ]
   *   ↓ 노드 맵 생성 ↓
   *   nodeMap = Map {
   *     "node-1" => { id: "node-1", name: "트리거", type: "MAMUAL_TRIGGER" },
   *     "node-2" => { id: "node-2", name: "HTTP 요청", type: "HTTP_REQUEST" },
   *     "node-3" => { id: "node-3", name: "데이터 처리", type: "HTTP_REQUEST" },
   *     "node-4" => { id: "node-4", name: "독립 노드", type: "HTTP_REQUEST" }
   *   }
   */
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  /**
   * 정렬된 노드 ID 배열을 노드 맵에서 찾아서 반환
   *   sortedNodeIds = ["node-1", "node-2", "node-3", "node-4"]
   *   ↓ 노드 맵에서 찾아서 반환 ↓
   *   sortedNodes = [
   *     { id: "node-1", name: "트리거", type: "MAMUAL_TRIGGER" },
   *     { id: "node-2", name: "HTTP 요청", type: "HTTP_REQUEST" },
   *     { id: "node-3", name: "데이터 처리", type: "HTTP_REQUEST" },
   *     { id: "node-4", name: "독립 노드", type: "HTTP_REQUEST" }
   *   ]
   * 참고:
   * !는 TypeScript 문법으로, "이 값이 null이나 undefined가 아님"을 단언
   * filter(Boolean)은 falsy 값(null, undefined, false, 0, "", NaN)을 제거
   */
  return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
};

export const sendWorkflowExecution = async (data: {
  workflowId: string;
  [key: string]: unknown;
}) => {
  await inngest.send({
    name: "workflows/execute.workflow",
    data,
    id: createId(),
  });
};
