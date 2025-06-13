
## 第二阶段：服务器与协助车辆的Bargaining Game设计

### 1. 背景与目标
在第一阶段，已经通过`bargainGA`算法实现了任务车辆与服务器之间的任务卸载和资源分配协商，服务器为每个任务 \( i \) 设定了资源价格 \( P_i \)，并分配了计算资源 \( f_i^{\text{server}} \)。然而，当服务器资源过载（即无法处理所有任务）时，需要将部分任务转包给协助车辆执行，以减轻服务器负担并确保任务满足时延要求。

在第二阶段，服务器与协助车辆之间通过Bargaining Game协商任务转包，目标是**最大化服务器和协助车辆双方效用的乘积**，实现公平且高效的任务分配和定价机制。这一机制将与两种对比算法进行比较：  
- `vickrey`（Vickrey拍卖，服务器支付第二低的报价）；  
- `da121ma`（服务器利润最大优先）。

---

### 2. 参与者与效用函数

#### 2.1 服务器（Server）
服务器作为任务转包方，希望以较低的成本 \( P(i,j) \) 将任务 \( i \) 转包给协助车辆 \( j \)，同时确保任务在时延要求内完成。其效用函数定义为：
\[ U_{\text{server}}(i,j) = P_i - P(i,j) - C_{\text{server},i,j}^{\text{tran}} \]
其中：
- \( P_i \)：服务器从任务车辆处获得的资源价格（第一阶段确定）。
- \( P(i,j) \)：服务器支付给协助车辆 \( j \) 的转包费用。
- \( C_{\text{server},i,j}^{\text{tran}} \)：服务器将任务 \( i \) 传输给协助车辆 \( j \) 的通信成本，计算为：
  \[ C_{\text{server},i,j}^{\text{tran}} = \gamma \theta_{\text{alloc}} \cdot \frac{L_i}{R_{\text{server},j}} \]
  其中，\( R_{\text{server},j} = B \log_2(1 + \text{SINR}_{\text{server},j}) \) 是服务器到协助车辆的传输速率，\( \theta_{\text{alloc}} = \frac{\theta_{\text{Server}}}{|\mathcal{M}|} \) 是分配的传输功率，\( \mathcal{M} \) 是参与转包的协助车辆集合。

**解释**：服务器的效用是其从任务车辆获得的收入 \( P_i \) 减去支付给协助车辆的费用 \( P(i,j) \) 和通信成本。

#### 2.2 协助车辆（Assistor Vehicle）
协助车辆 \( j \) 作为任务执行方，希望获得较高的报酬 \( P(i,j) \) 以补偿其计算和能耗成本。其效用函数定义为：
\[ U_j(i) = P(i,j) - \gamma k_c (f_i^j)^2 C_i L_i \]
其中：
- \( P(i,j) \)：协助车辆从服务器获得的转包费用。
- \( \gamma k_c (f_i^j)^2 C_i L_i \)：协助车辆执行任务 \( i \) 的能耗成本，\( f_i^j \) 是协助车辆分配给任务 \( i \) 的计算资源，\( k_c \) 是能耗系数，\( \gamma \) 是能量成本单价。

**解释**：协助车辆的效用是其获得的报酬减去执行任务的能耗成本。

---

### 3. Bargaining Game的设定
服务器与协助车辆 \( j \) 通过Bargaining Game协商转包费用 \( P(i,j) \)，以最大化双方效用的乘积：
\[ \max_{P(i,j)} \left[ U_{\text{server}}(i,j) \times U_j(i) \right] \]

#### 3.1 约束条件
1. **个体理性**：
   - 服务器：\( U_{\text{server}}(i,j) \geq 0 \)  
     \[ P_i - P(i,j) - C_{\text{server},i,j}^{\text{tran}} \geq 0 \Rightarrow P(i,j) \leq P_i - C_{\text{server},i,j}^{\text{tran}} \]
   - 协助车辆：\( U_j(i) \geq 0 \)  
     \[ P(i,j) - \gamma k_c (f_i^j)^2 C_i L_i \geq 0 \Rightarrow P(i,j) \geq \gamma k_c (f_i^j)^2 C_i L_i \]

2. **时延约束**：任务 \( i \) 在协助车辆 \( j \) 上的总执行时间需满足最大时延要求：
   \[ t_{i,j}^{\text{off}} = \frac{L_i}{R_{\text{server},j}} + \frac{L_i C_i}{f_i^j} = t_i^{\text{allow}} \] (该时间是用户与服务器达成的任务时间，需要遵守)

3. **资源约束**：协助车辆 \( j \) 的计算资源 \( f_i^j \) 需满足其总资源限制：
   \[  f_i^j \leq F_j^{\text{max}} \]
   其中 \( F_j^{\text{max}} \) 是协助车辆 \( j \) 的最大计算能力。

---

### 4. 求解Bargaining Game
为了找到最优的转包费用 \( P(i,j) \)，我们将效用乘积最大化问题转化为一个优化问题。

#### 4.1 目标函数
\[ \max_{P(i,j)} \left[ \left( P_i - P(i,j) - C_{\text{server},i,j}^{\text{tran}} \right) \times \left( P(i,j) - \gamma k_c (f_i^j)^2 C_i L_i \right) \right] \]

#### 4.2 约束
\[ \gamma k_c (f_i^j)^2 C_i L_i \leq P(i,j) \leq P_i - C_{\text{server},i,j}^{\text{tran}} \]

假设 \( f_i^j \) 是预先确定的（例如协助车辆根据任务需求和自身资源提供计算能力），我们可以对 \( P(i,j) \) 求解最优值。

令：
- \( a = P_i - C_{\text{server},i,j}^{\text{tran}} \)（服务器的最大可接受价格）。
- \( b = \gamma k_c (f_i^j)^2 C_i L_i \)（协助车辆的最低要求价格）。

目标函数简化为：
\[ \max_{P(i,j)} \left[ (a - P(i,j)) \times (P(i,j) - b) \right] \]

对 \( P(i,j) \) 求导：
\[ \frac{d}{d P(i,j)} \left[ (a - P(i,j))(P(i,j) - b) \right] = (a - P(i,j)) + (P(i,j) - b)(-1) = a - b - 2 P(i,j) \]

令导数等于0：
\[ a + b - 2 P(i,j) = 0 \]
\[ P(i,j)^* = \frac{a + b}{2} = \frac{ (P_i - C_{\text{server},i,j}^{\text{tran}}) + \gamma k_c (f_i^j)^2 C_i L_i }{2} \]

#### 4.3 结果解释


 最优转包费用 \( P(i,j)^* \) 是服务器最大可接受价格 \( a \) 和协助车辆最低要求价格 \( b \) 的平均值。这种折中方案确保了双方效用的平衡，体现了Bargaining Game的公平性。
当协助车辆的最低要求价格大于服务器的最大可接受价格时候，协商失败。


### 5. 任务分配与资源调度
在实际操作中，服务器需要为每个过载任务 \( i \) 选择合适的协助车辆 \( j \)，并确定转包费用和资源分配。具体步骤如下：

1. **任务-协助车辆匹配**：
   - 对于每个过载任务 \( i \)，服务器计算与每个协助车辆 \( j \) 的 \( P(i,j)^* \) 和对应的效用 \( U_{\text{server}}(i,j) \) 和 \( U_j(i) \)。

2. **选择最优协助车辆**：
   - 对于任务 \( i \)，选择使效用乘积 \( U_{\text{server}}(i,j) \times U_j(i) \) 最大的协助车辆 \( j^* \)。

3. **资源分配**：
   - 确定协助车辆 \( j^* \) 为任务 \( i \) 分配的计算资源 \( f_i^{j^*} \)，满足时延约束 \( t_{i,j^*}^{\text{off}} \leq t_i^{\text{max}} \) 和资源约束 \( \sum_{i} f_i^{j^*} \leq F_{j^*}^{\text{max}} \)。

---

### 6. 与对比算法的比较

#### 6.1 Vickrey拍卖（`vickrey`）
- **机制**：服务器作为买家，协助车辆作为卖家，提交执行任务的报价（基于能耗成本）。服务器选择最低报价的协助车辆，并支付第二低的报价。
- **效用**：
  - 服务器：\( U_{\text{server}}(i,j) = P_i - P_{\text{second-lowest}} - C_{\text{server},i,j}^{\text{tran}} \)
  - 协助车辆：\( U_j(i) = P_{\text{second-lowest}} - \gamma k_c (f_i^j)^2 C_i L_i \)
- **特点**：激励协助车辆提供真实报价，但可能导致服务器支付较高费用。

#### 6.2 服务器利润最大优先（`da121ma`）
- **机制**：服务器选择使自身效用 \( U_{\text{server}}(i,j) \) 最大的协助车辆，通常支付较低的 \( P(i,j) \)。
- **效用**：
  - 服务器：最大化 \( P_i - P(i,j) - C_{\text{server},i,j}^{\text{tran}} \)。
  - 协助车辆：\( U_j(i) \) 可能较低甚至为负。
- **特点**：偏向服务器利益，可能降低协助车辆的参与积极性。

#### 6.3 Bargaining Game的优势
- 通过最大化效用乘积 \( U_{\text{server}}(i,j) \times U_j(i) \)，确保服务器和协助车辆的利益平衡。
- 避免了`vickrey`中可能的高费用问题和`da121ma`中协助车辆低效用的不公平性。
- 公平性激励协助车辆积极参与任务转包。

---
