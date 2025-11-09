# Agentic Architecture

## Introduction

Agentic architecture is a way of thinking about the interactions between agents and tools, and how those interactions
can be represented in a structured way. This is important for understanding how agents can work together to solve
complex problems, and how their interactions can be modeled, recorded and analyzed.

## Definitions

Let $A$ be an **agent** with **tools**, $T_A = \{ T_1, T_2, \dots, T_n \}$. Suppose an initial **user input**, $u_1$, is
sent to $A$ through $chat$, and that $A$, having been instructed by its **system prompt** $s_A$, determines that $T_i$
should be called. Then $A$ will construct its first query, $q_1^{(i)}$, and call $T_i$ with it, giving us the **tool
result**,

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

The **value** of this output, $v_1 = chat^*(r_1^{(i)})$ is then interpreted by the user as agent $A$'s response
to $u_1$. As such, the input-output pair $(u_1, v_1)$ is added to the **chat history** for $A$, $h$, in the form of a *
*cycle**, $c_1 = (u_1, v_1)$. Giving us

$$
h = [\ c_1\  ] = [\ (u_1, v_1)\ ]
$$

This limited view of $h$ does not include the query made by $A$ or the result from its associated tool-call. To include
such messages and artifacts in our construction of $A$'s chat history, we can define **the derivative of h**,

$$
h' = [\ c'_1\  ] = [\ (u_1, q_1^{(i)}, r_1^{(i)}, v_1)\ ]
$$

After $k$ such cycles of interaction between the user and $A$, we can denote the agent's chat history up to the end
of $c_k$ as

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

where $m$ is taken to be the number of total calls made throughout a user-agent interaction. A more formal treatment for
such objects can be found in the [above](./algebra.md).

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

More complicated combinations of interactions within cycles can be depicted in a similar way. Consider the 5 cycles in
the example below



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
        subgraph c5
            u5 --> A
            A --> u''
            u'' --> C
            v5 --> A
            A --> v''
            v'' --> C
        end
    ">
</p>

1. $c_1$ is a simple input-output pair between the user and $A$
1. In $c_2$, $A$ invokes a tool, $T$ as we've already seen.
1. In $c_3$, the tool $T$ invokes a second agent $B$ during its execution.
1. $c4$ sees $A$ call two separate tools before responding to the user.
1. and in $c_5$, $A$ invokes a third agent directly without a tool to do so.

## Implementaion

In practice, we have found it helpful to mostly avoid cases like $c_5$, and enable one agent to invoke another strictly
through the use of a tool, thought of as an agent-tool. This creates a distinction between the first two "layers"
of $A$'s chat history $h$ as being strictly user-agent message pairs in the first layer and mostly agent-tool message
pairs in the second.

We have come to refer to these layers as $h$ and $h'$. $h''$ has been reserved for referring to chat history that is
built from all its cycles to the fullness of their various depths.

In storing the chat history for a given agent $A$ over $k$ cycles, we always persist the entirety of said
history, $h''_k$, and have several methods for constructing $h_k$ and $h'_k$ from it.

It has also proved beneficial to store the content of messages (input-output pairs) and a label for the agent or tool
those messages flowed to or from in a single node, so that $c_2$ from above is thought of as two nodes, the tool-call
being a child of the input-output pair between the user and the agent, as in:



<p>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<img src="/blog/agentic-architecture/img/c_prime_node.svg" width="600" alt="
    graph LR
        A(u1,v1) --> Ti(q1,r1)
    ">
</p>

This makes it possible to represent each cycle as a Directed, Acyclic Graph where the input and output of any user-agent
or agent-tool interaction is stored as a pair _inside the node_. This greatly decreases the complexity of these
structures and makes them much easier to store in a database.



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
        subgraph c5 (A->C)
            u5 --> A
            A --> u''
            u'' --> C
            v5 --> A
            A --> v''
            v'' --> C
        end
    ">
</p>

This structured view of agentic interactions provides a flexible and extensible foundation for modeling complex
agent-tool-user ecosystems. By formalizing cycles, derivative histories, and graph representations, we enable clearer
reasoning about system behavior, greater ease in monitoring and validation, and more reliable persistence of
interactions for future analysis. As these systems grow in sophistication, such foundational models will be critical for
ensuring that agents remain aligned, auditable, and effective in solving the increasingly intricate problems they are
designed to address.