# 车联网场景下基于任务价值感知的两阶段协同优化框架

第一阶段为用户卸载任务到服务器，服务器提出单位资源定价。第二阶段为服务器将过载任务进行转包赚取差价。
## 场景描述
在车联网环境中，存在两类车辆集合：
- **任务车辆**：集合为 $ \mathcal{I} = \{1, 2, \ldots, I\} $，每个任务车辆需处理一个计算密集型任务，但本地资源受限。
- **协助车辆**：集合为 $ \mathcal{J} = \{1, 2, \ldots, J\} $，具备更强计算能力，可接收服务器转包任务。

**通信链路**：
1. 任务车→服务器：传输速率 $ R_{i,\text{server}} = B \log_2(1 + \text{SINR}_{i,\text{server}}) $
2. 服务器→协助车：传输速率 $ R_{\text{server},j} = B \log_2(1 + \text{SINR}_{\text{server},j}) $

**研究目标**：  
通过改进效用函数设计，提出混合定价策略（统一定价+差异定价），解决服务器资源受限下的多阶段任务卸载与资源分配问题。

---

## 系统模型

### 1. 任务模型
| 参数 | 物理意义 |
|------|----------|
| $ L_i $ | 任务 $ i $ 的数据大小（比特） |
| $ C_i $ | 每比特所需CPU周期数（周期/比特） |
| $ t_i^{\text{max}} $ | 任务最大允许延迟（秒） |

### 2. 通信模型
设定车辆V2R的通讯模型参考文献为 **Joint task offloading and Resource Optimization in NOMA-Based Vehicular Edge Computing: A Game-Theoretic DRL Approach**，，由于本场景中只有单个服务器，因此不考虑 inter-edge interference（边缘间干扰）。

设定服务器的最大传输功率为 \( \theta_{\text{Server}} \)，任务的传输功率由服务器决定，表示为 \( \theta_{alloc} \)。通常为$ \theta_{alloc} = \frac{\theta_{\text{Server}}}{ K} $其中 \( K \) 是当前阶段参与任务执行的车辆的数量。传输双方的channel gain（信道增益）可表示为 $ h_{s,d} = \frac{\eta}{\text{d}_{s,d}^{\varphi/2}} $，其中 \( \eta \) 是 Rayleigh dributed small scale fading（瑞利分布的小尺度衰落），遵从 \( \eta \sim CN(0,1) \)，而 \( \varphi \) 是 large-scale path loss exponent（大尺度路径损耗指数）。


因此，在第一阶段，任务车辆选择服务器卸载，任务车辆为source，服务器作为destination，则参与通信的集合为$ \mathcal{I}$，$ \theta_{alloc} = \frac{\theta_{\text{Server}}}{ |\mathcal{I}|} $。则 SINR（信号干扰噪声比）可表示为：

\[ SINR_{i,server} = \frac{|h_{i,server}|^2 \theta_{alloc}}{\sum_{i' \in I\backslash\{i\}} |h_{i', server}|^2 \theta_{i',server} + N_0} \]

其中 $i'$满足$ \{ i' \mid |h_{i',server}|^2 < |h_{i,server}|^2, \forall i' \in  \mathcal{I}\backslash\{i\},  x_{i'} = 1,  \sum_{j}^J z_{ i', j} = 0\} $，\( \sum_{i' \in V_i} |h_{i', server}|^2 \theta_{i',server} \) 表示 intra-edge interference（边缘内部干扰）

同理，在第二阶段，服务器将未能处理的任务外包给协助车辆，此时服务器作为source，协助车辆作为destination，$K = |\mathcal{M}|$，其中$\mathcal{M}$是协助车辆$\mathcal{J}$子集，$ \theta_{alloc} = \frac{\theta_{\text{Server}}}{ |\mathcal{M}|} $。本文设定协助车辆数量充足，因此集合长度等于未能处理的任务的数量。则SINR可以表示为：

\[ SINR_{server,j} = \frac{|h_{server,j}|^2 \theta_{alloc}}{\sum_{j' \in \mathcal{M}\backslash\{j\}} |h_{server,j'}|^2 \theta_{alloc} + N_0} \]


其中 \( j' \) 满足$\{ j' \mid |h_{server,j'}|^2 < |h_{server,j'}|^2, \forall j' \in \mathcal{M}\backslash\{j\},  x_{i'} = 1,  \sum_{i}^I z_{ i, j'} = 1\} $。

### 3. 计算与能耗模型
- **本地执行**：  
  - 时间：$ t_i^{\text{local}} = \frac{L_i C_i}{f_i} $  
  - 能耗：$ E_i^{\text{local}} = k_c f_i^2 L_i C_i $  
  - 金钱花费：$ M_i^{\text{local}} = \gamma E_i^{\text{local}} $

- **卸载执行**：  
  - 总时间：$ t_i^{\text{off}} = \frac{L_i}{R_{i,\text{server}}} + \frac{L_i C_i}{f_i^{\text{server}}} $  
  - 总成本：$ M_i^{\text{off}} = \gamma \theta_i t_i^{\text{tran}} + P_i $

---

## 改进后的效用函数

### 1. 用户效用函数
$$
U_i^{\text{off}} = V_i \cdot \mathbb{I}(t_i^{\text{off}} \leq t_i^{\text{max}}) - \left( M_i^{\text{off}} + \mu_i \cdot t_i^{\text{off}} \right)
$$
- **任务价值衰减权重因子**：$ \mu_i $（时间转货币单位）

### 2. 服务器效用函数
$$
U_{\text{server}} = \sum_{i=1}^I \left[ P_i \cdot f_i^{\text{server}} - \gamma k_c (f_i^{\text{server}})^2 C_i L_i \right] - \sum_{i=1}^I \sum_{j=1}^J z_{i,j} \cdot \left( C_{\text{server},i,j}^{\text{tran}} + P(i,j) \right)
$$

### 3. 协助车辆效用函数
$$
U_j = \sum_{i=1}^I z_{i,j} \cdot \left[ P(i,j) - \gamma k_c (f_i^j)^2 C_i L_i \right]
$$

---


### 阶段一： 差分定价（Bargaining Game）

单个用户与服务器进行bargainGame，算法为BargainGA，最大化两者效用的乘积。对比算法有：

1. 基于用户最小资源需求的bargainGame, mrnbp
2. 基于stackelberg的差异定价，设定用户因效用过低退出的效用门槛，mvsp
### 阶段二：bargain（Server 过载转包）

在本阶段，我们重点解决当服务器资源过载时，如何将任务转包给协助车辆执行的问题。传统的任务转包机制通常基于**拍卖**或**合约**的方式实现，将作为算法进行对比：

1. 基于服务器最大利润的拍卖da121ma
2. 服务器支付拍卖中次最小花费的vickrey

- **拍卖机制**：服务器作为买家，协助车辆作为卖家，基于双向拍卖实现任务转包。
- **个体理性约束**：
  - 服务器：$ P(i,j) \leq p_i^* $
  - 协助车辆：$ P(i,j) \geq \gamma k_c (f_i^j)^2 C_i L_i $

---
在第一阶段，用户与服务器进行任务执行协商后，由于服务器的资源不足以完全执行用户的所有任务，因此将过载的任务转交给协助车辆进行执行，进而赚取差价。以服务器与协助车辆进行
bargainGame作为本文提出的算法，与传统的拍卖算法进行比对。

单个协助车辆与服务器进行bargainGame，最大化两者效用的乘积。



