# **Minimal VALUE Requirement-Based Stackelberg Pricing (MVSP) 第一阶段算法对比**。


## **1. 用户的最佳资源请求和价格切换点**

用户的目标是最大化其效用函数：

\[
U_i^{\text{off}} = V_i - \left( \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} + p_i f_i^{\text{server}} + \mu_i \left( \frac{L_i}{R_{i,\text{server}}} + \frac{L_i C_i}{f_i^{\text{server}}} \right) \right)
\]

其中：
- \( V_i \)：任务完成的价值
- \( \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} \)：传输成本
- \( p_i f_i^{\text{server}} \)：支付给服务器的费用
- \( \mu_i \left( \frac{L_i}{R_{i,\text{server}}} + \frac{L_i C_i}{f_i^{\text{server}}} \right) \)：时间成本


### **(1) 无约束情况下的最优资源请求**
忽略时间约束，对 \( U_i^{\text{off}} \) 关于 \( f_i^{\text{server}} \) 求偏导并令其为零：

\[
\frac{\partial U_i^{\text{off}}}{\partial f_i^{\text{server}}} = -p_i + \frac{\mu_i L_i C_i}{(f_i^{\text{server}})^2} = 0
\]

解得：

\[
f_i^{\text{server}} = \sqrt{\frac{\mu_i L_i C_i}{p_i}}
\]

### **(2) 受时间约束的最小资源量 \( f_i^{\text{min}} \)**
时间约束取等号时，计算最小资源需求：

\[
\frac{L_i}{R_{i,\text{server}}} + \frac{L_i C_i}{f_i^{\text{min}}} = t_i^{\text{max}}
\]

解得：

\[
f_i^{\text{min}} = \frac{L_i C_i}{t_i^{\text{max}} - \frac{L_i}{R_{i,\text{server}}}}
\]

### **(3) 用户的最佳资源请求**
综合无约束解和时间约束，用户选择：

\[
f_i^{\text{server}} = \max\left( \sqrt{\frac{\mu_i L_i C_i}{p_i}}, f_i^{\text{min}} \right)
\]

### **(4) 价格切换点 \( p_i^{\text{switch}} \)**
当无约束解等于约束解时，价格达到切换点：

\[
\sqrt{\frac{\mu_i L_i C_i}{p_i^{\text{switch}}}} = f_i^{\text{min}}
\]

解得：

\[
p_i^{\text{switch}} = \frac{\mu_i L_i C_i}{(f_i^{\text{min}})^2}
\]

## **2. 价格区间的划分**
根据 \( p_i^{\text{switch}} \)，价格分为两个区域：
- **非约束区域**（\( p_i \leq p_i^{\text{switch}} \)）：\( f_i^{\text{server}} = \sqrt{\frac{\mu_i L_i C_i}{p_i}} \)
- **约束区域**（\( p_i > p_i^{\text{switch}} \)）：\( f_i^{\text{server}} = f_i^{\text{min}} \)

### **2.1. 非约束区域（\( p_i \leq p_i^{\text{switch}} \)）**

#### **(1) 用户的最佳资源请求**
\[
f_i^{\text{server}} = \sqrt{\frac{\mu_i L_i C_i}{p_i}}
\]

#### **(2) 用户的效用约束**
用户参与卸载需满足最低效用要求：

\[
U_i^{\text{off}} \geq \alpha \cdot V_i
\]

其中 \( \alpha \)（\( 0 < \alpha < 1 \)）是效用最小比例阈值。代入 \( f_i^{\text{server}} \)，化简得：

\[
p_i \leq p_i^{\text{minimalUtility}} = \left( \frac{(1 - \alpha) V_i - \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} - \mu_i \frac{L_i}{R_{i,\text{server}}}}{2 \sqrt{\mu_i L_i C_i}} \right)^2
\]

#### **(3) 服务器的成本约束**
服务器效用为：

\[
U_{\text{server}} = p_i f_i^{\text{server}} - \gamma k_c (f_i^{\text{server}})^2
\]

代入 \( f_i^{\text{server}} \)，得：

\[
U_{\text{server}} = \sqrt{p_i \mu_i L_i C_i} - \frac{\gamma k_c \mu_i L_i^2 C_i^2}{p_i}
\]

要求 \( U_{\text{server}} \geq 0 \)，解得：

\[
p_i \geq p_{\text{server},i}^{\text{cost}} = \gamma^{2/3} k_c^{2/3} \mu_i^{1/3} L_i C_i
\]

#### **(4) 可行价格范围**
综合约束，价格范围为：

\[
p_i \in \left[ p_{\text{server},i}^{\text{cost}}, \min\left( p_i^{\text{switch}}, p_i^{\text{minimalUtility}} \right) \right]
\]

#### **(5) 服务器的最优价格**
\( U_{\text{server}} \) 随 \( p_i \) 递增，最优价格取上限：

\[
p_i^* = \min\left( p_i^{\text{switch}}, p_i^{\text{minimalUtility}} \right)
\]

需满足 \( p_i^* \geq p_{\text{server},i}^{\text{cost}} \)。

### **2.2 约束区域（\( p_i > p_i^{\text{switch}} \)）**

#### **(1) 用户的最佳资源请求**
\[
f_i^{\text{server}} = f_i^{\text{min}}
\]

#### **(2) 用户的效用约束**
代入 \( f_i^{\text{server}} = f_i^{\text{min}} \)，得：

\[
p_i \leq p_i^{\text{minimalUtility}} = \frac{(1 - \alpha) V_i - \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} - \mu_i t_i^{\text{max}}}{f_i^{\text{min}}}
\]

#### **(3) 服务器的成本约束**
服务器效用为：

\[
U_{\text{server}} = p_i f_i^{\text{min}} - \gamma k_c (f_i^{\text{min}})^2 C_i L_i
\]

要求 \( U_{\text{server}} \geq 0 \)，解得：

\[
p_i \geq p_{\text{server},i}^{\text{cost}} = \gamma k_c f_i^{\text{min}} C_i L_i
\]

#### **(4) 可行价格范围**
价格范围为：

\[
p_i \in \left[ \max\left( p_i^{\text{switch}}, p_{\text{server},i}^{\text{cost}} \right), p_i^{\text{minimalUtility}} \right]
\]

#### **(5) 服务器的最优价格**
\( U_{\text{server}} \) 随 \( p_i \) 递增，最优价格为：

\[
p_i^* = p_i^{\text{minimalUtility}}
\]

需满足 \( p_i^* \geq \max\left( p_i^{\text{switch}}, p_{\text{server},i}^{\text{cost}} \right) \)。

### **2.3 综合最优价格选择**
服务器比较两个区域的效用：
- **非约束区域**：若 \( p_i^{\text{low}} = \min\left( p_i^{\text{switch}}, p_i^{\text{minimalUtility}} \right) \geq p_{\text{server},i}^{\text{cost}} \)，计算 \( U_{\text{server}}^{\text{low}} \)
- **约束区域**：若 \( p_i^{\text{high}} = p_i^{\text{minimalUtility}} \geq \max\left( p_i^{\text{switch}}, p_{\text{server},i}^{\text{cost}} \right) \)，计算 \( U_{\text{server}}^{\text{high}} \)
- 选择使 \( U_{\text{server}} \) 最大的 \( p_i^* \)，或仅存的可行解。

---