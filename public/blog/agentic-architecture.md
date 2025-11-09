# Agentic Architecture

## Introduction

Agentic architecture is a way of thinking about the interactions between agents and tools, and how those interactions can be represented in a structured way. This is important for understanding how agents can work together to solve complex problems, and how their interactions can be modeled, recorded and analyzed.

## Definitions

Let $A$ be an **agent** with **tools**, $T_A = \{ T_1, T_2, \dots, T_n \}$. Suppose an initial **user input**, $u_1$, is
sent to $A$ through $chat$, and that $A$, having been instructed by its **system prompt** $s_A$, determines that $T_i$
should be called. Then $A$ will construct its first query, $q_1^{(i)}$, and call $T_i$ with it, giving us the **tool result**,

$$
r_1^{(i)} = T_i(q_1^{(i)})
$$

This tool result will then be interpreted by $A$ via its internal chat method, $chat^*$. 
  
  
  
<p>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="/blog/agentic-architecture/img/c_prime.svg" width="600" alt="
    graph LR
    U1 -- A.chat --> Q1((q1^(i)))
    Q1 -- Ti --> R1((r1^(i)))
    R1 -- A.chat* --> V1((v1))
    ">
</p>

The **value** of this output, $v_1 = chat^*(r_1^{(i)})$ is then interpreted by the user as agent $A$'s response to $u_1$. As such, the input-output pair $(u_1, v_1)$ is added to the **chat history** for $A$, $h$, in the form of a **cycle**, $c_1 = (u_1, v_1)$. Giving us

$$
h = [\ c_1\  ] = [\ (u_1, v_1)\ ]
$$

This limited view of $h$ does not include the query made by $A$ or the result from its associated tool-call. To include such messages and artifacts in our construction of $A$'s chat history, we can define **the derivative of h**,

$$
h' = [\ c'_1\  ] = [\ (u_1, q_1^{(i)}, r_1^{(i)}, v_1)\ ]
$$


After $k$ such cycles of interaction between the user and $A$, we can denote the agent's chat history up to the end of $c_k$ as

$$
h_k = [\ c_i\ ]_{i=1}^k = [\ (u_1, v_1),\ (u_2,\ v_2),\ \dots,\ (u_k, v_k)\ ]
$$

where $h'_k$ is defined similarly but with additional values in particular cycles from the query and result arrays, 

$$
\begin{align}
q = [\ q_1^{(i)}\ q_2^{(i)}\ q_3^{(i)}\ \cdots\ q_m^{(i)}\ ] \\
r = [\ r_1^{(i)}\ r_2^{(i)}\ r_3^{(i)}\ \cdots\ r_m^{(i)}\ ] \\
\end{align}
$$

where $m$ is taken to be the number of total calls made throughout a user-agent interaction. A more formal treatment for such objects can be found in the [Algebra of Agentic Architectures](/blog/agentic-architecture-algebra). 

## Graph Theoretic Approach

Cycles can be represented in many ways, consider this representation of a cycle containing a single tool-call 
  


<p>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="/blog/agentic-architecture/img/c_prime_graph.svg" width="600" alt="
    graph LR
        u1 --> A
        A --> q1_i^i
        q1_i^i --> Ti
        Ti --> r1_i^i
        r1_i^i --> A
        A --> v1
    ">
</p>

More complicated combinations of interactions within cycles can be depicted in a similar way. Consider the 4 cycles in the example below
  


<p>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="/blog/agentic-architecture/img/h_pp.svg" width="600" alt="
    graph TD
        subgraph c1
            u1 --> A
            A --> v1
        end    
        subgraph c2
            u2 --> A
            A --> q
            q --> T
            T --> r
            r --> A
            A --> v2
        end    
        subgraph c3
            u3 --> A
            A --> q
            q --> T
            T --> u'
            u' --> B
            T --> v'
            v' --> B
            r --> A
            A --> v3
        end    
        subgraph c4
            u4 --> A
            A --> q
            q --> T
            T --> r
            r --> A
            A --> q'
            q' --> T'
            T' --> r'
            r' --> A
            A --> v4
        end
    ">
</p>

1. $c_1$ is a simple input-output pair between the user and $A$ 
2. In $c_2$, $A$ invokes a tool, $T$ as we've already seen.
3. In $c_3$, the tool $T$ invokes a second agent $B$ during its execution.
4. $c4$ sees $A$ call two separate tools before responding to the user.

## Implementation

In practice, we have found it helpful to mostly avoid cases like $c_5$, and enable one agent to invoke another strictly through the use of a tool, thought of as an agent-tool. This creates a distinction between the first two "layers" of $A$'s chat history $h$ as being strictly user-agent message pairs in the first layer and mostly agent-tool message pairs in the second.

We have come to refer to these layers as $h$ and $h'$. $h''$ has been reserved for referring to chat history that is built from all its cycles to the fullness of their various depths.

In storing the chat history for a given agent $A$ over $k$ cycles, we always persist the entirety of said history, $h''_k$, and have several methods for constructing $h_k$ and $h'_k$ from it.

It has also proved beneficial to store the content of messages (input-output pairs) and a label for the agent or tool those messages flowed to or from in a single node, so that $c_2$ from above is thought of as two nodes, the tool-call being a child of the input-output pair between the user and the agent, as in:
  


<p>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="/blog/agentic-architecture/img/c_prime_node.svg" width="600" alt="
    graph LR
        A(u1,v1) --> Ti(q1,r1)
    ">
</p>

This makes it possible to represent each cycle as a Directed, Acyclic Graph where the input and output of any user-agent or agent-tool interaction is stored as a pair _inside the node_.  This greatly decreases the complexity of these structures and makes them much easier to store in a database. 
  


<p>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="/blog/agentic-architecture/img/h_pp_node.svg" width="600" alt="
    a list of grpahs for each cycle as before. 
    their simpler DAG representations are nex
    t to each one (in parentheses).
    graph TD
        subgraph c1 (A)
            u1 --> A
            A --> v1
        end    
        subgraph c2 (A->T)
            u2 --> A
            A --> q
            q --> T
            T --> r
            r --> A
            A --> v2
        end    
        subgraph c3 (A->T->B)
            u3 --> A
            A --> q
            q --> T
            T --> u'
            u' --> B
            T --> v'
            v' --> B
            r --> A
            A --> v3
        end    
        subgraph c4 (A  ->T\n\t->T')
            u4 --> A
            A --> q
            q --> T
            T --> r
            r --> A
            A --> q'
            q' --> T'
            T' --> r'
            r' --> A
            A --> v4
        end
    ">
</p>

This structured view of agentic interactions provides a flexible and extensible foundation for modeling complex agent-tool-user ecosystems. By formalizing cycles, derivative histories, and graph representations, we enable clearer reasoning about system behavior, greater ease in monitoring and validation, and more reliable persistence of interactions for future analysis. As these systems grow in sophistication, such foundational models will be critical for ensuring that agents remain aligned, auditable, and effective in solving the increasingly intricate problems they are designed to address.

## Access Control and Agent Orchestration

### Matrix-Based Access Control

In complex multi-agent systems, controlling which agents can invoke which tools and other agents becomes critical. We formalize this through an **access control matrix** that encodes these relationships:

```
  A B C D E | 0 1 2 3 4 5 6
A       1 1 | 1 1
B           |     1 1   1
C   1       | 1           1
D     1     | 1
E           |   1     1
```

This matrix decomposes into two components:

1. **Agent-to-Agent Access** (left square): Which agents can invoke other agents
2. **Agent-to-Tool Access** (right rectangle): Which agents can use which tools

### The Agent Dispatch Pattern

Tool 0 serves as a special **agent dispatch tool** that mediates all inter-agent communication. This creates a clean separation:
- Direct tool invocations (tools 1-6) perform specific functions
- Dispatch invocations (tool 0) delegate to other agents

Given:
- **A** = {A, B, C, D, E} as the set of agents
- **T** = {0, 1, 2, 3, 4, 5, 6} as the set of tools
- **T₀** = {0} as the dispatch tool
- **A₀** = {A} as the user-facing agent

The access relations become:
- **R_AT**: Agent-to-tool access = {(A,0), (A,1), (B,2), (B,3), (B,5), (C,0), (C,6), (D,0), (E,1), (E,4)}
- **R_AA**: Agent-to-agent access = {(A,D), (A,E), (C,B), (D,C)}

### Path Generation and Reachability

From the access matrix, we can generate all possible execution paths. For agent A:

```
A
A -> 1
A -> 0 -> D
A -> 0 -> D -> 0 -> C
A -> 0 -> D -> 0 -> C -> 0 -> B
A -> 0 -> D -> 0 -> C -> 0 -> B -> 2
A -> 0 -> D -> 0 -> C -> 0 -> B -> 3
A -> 0 -> D -> 0 -> C -> 0 -> B -> 5
A -> 0 -> D -> 0 -> C -> 6
A -> 0 -> E
A -> 0 -> E -> 1
A -> 0 -> E -> 4
```

Each path represents a potential execution trace τ:
```
τ ::= a                    (agent alone)
    | a → t                (agent uses tool)
    | a → 0 → a' → τ'      (agent dispatches to another)
```

### Loop Prevention Through Matrix Analysis

A critical property for system reliability is preventing infinite loops in agent invocations. We can verify this mathematically using the agent-to-agent submatrix.

**Theorem (Loop Prevention):** An agent system has no infinite invocation loops if and only if the agent-to-agent adjacency matrix M is nilpotent, i.e., ∃n such that M^n = 0.

**Proof:**
Let M be the agent-to-agent adjacency matrix extracted from the access control matrix:

```
M = [0 0 0 1 1]
    [0 0 0 0 0]
    [0 1 0 0 0]
    [0 0 1 0 0]
    [0 0 0 0 0]
```

Computing successive powers:
- M² represents 2-hop paths between agents
- M³ represents 3-hop paths between agents
- ...
- M^n represents n-hop paths

If M^n = 0 for some n, then no paths of length n or greater exist, preventing infinite loops.

**Unit Test Implementation:**
```python
import numpy as np

def test_no_infinite_loops(access_matrix):
    """
    Verify that the agent dispatch graph has no cycles
    by checking that M^n = 0 for some n ≤ |agents|
    """
    # Extract agent-to-agent submatrix
    n_agents = 5  # A, B, C, D, E
    M = access_matrix[:n_agents, :n_agents]

    # Check nilpotency
    M_power = M.copy()
    for k in range(1, n_agents + 1):
        if np.trace(M_power) > 0:
            raise AssertionError(f"Matrix has self-loop at depth {k}")

        M_power = M @ M_power
        if np.all(M_power == 0):
            return True  # Nilpotent at power k+1

    # Alternative: Check that trace(M^k) = 0 for all k
    # The trace counts cycles of length k
    for k in range(1, n_agents + 1):
        if np.trace(np.linalg.matrix_power(M, k)) != 0:
            raise AssertionError(f"Cycles of length {k} detected")

    return True
```

This mathematical guarantee ensures that:
1. No agent can invoke itself (directly or indirectly)
2. All invocation chains eventually terminate
3. The system is deadlock-free by construction

### Integration with Graph-Theoretic Model

The access control matrix naturally maps to our DAG representation:

1. **Nodes**: Each (agent, input, output) tuple becomes a node
2. **Edges**: Tool 0 invocations create parent-child relationships
3. **Depth**: Number of dispatch (tool 0) calls in a path
4. **Width**: Number of direct tools available to an agent

This creates a **stratified graph** where:
- Layer 0: User-facing agent A
- Layer 1: Directly accessible agents {D, E}
- Layer 2: Indirectly accessible agents {C}
- Layer 3: Deeply nested agents {B}

The maximum depth is bounded by the nilpotency index of M, providing a formal guarantee on execution complexity.

## Persistent Storage of Traces and Chat Logs

The theoretical framework above provides the foundation for how we think about agent interactions, but practical implementation requires careful consideration of how these traces (also called chat logs) are persisted and queried.

### Database Schema Design

The trace storage system uses a self-referential table structure where each record represents a node in the interaction graph. Key fields include:

- **id**: Unique identifier for each trace entry (auto-incrementing)
- **parent_id**: Reference to the calling trace (NULL for root nodes in a cycle)
- **cycle_id**: Groups all traces within a single user-agent interaction cycle
- **call_order**: Sequential ordering within the same parent context
- **group_id**: Session or group identifier for grouping related cycles
- **fn**: The symbolic name of the function/agent/tool being invoked
- **input/output**: JSON storage of the actual data flowing through the system
- **exception**: Error details if the invocation failed
- **prompt_versions**: Version tracking for prompt evolution
- **app_version**: Version tracking for tool implementation evolution
- **timestamps**: Creation and update times for temporal analysis

### Key Design Principles

1. **Self-Referential Structure**: The parent_id creates a tree structure within each cycle, enabling reconstruction of the full execution DAG.

2. **Automatic ID Assignment**: Database triggers handle cycle_id and call_order assignment, ensuring consistency:
   - Root nodes get a new cycle_id
   - Child nodes inherit their parent's cycle_id
   - call_order increments within sibling groups

3. **JSON Flexibility**: Input/output stored as JSON allows for varying schemas across different agent types while maintaining queryability on indexed fields.

4. **Version Tracking**: Prompt versions are captured at execution time, enabling analysis of system behavior changes over time.
