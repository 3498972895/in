# **Minimal Requirement-Based Nash Bargaining Pricing (MR-NBP) 第一阶段对比算法**  

## **1. 最低资源需求下的资源分配**  
**定义**：当用户 $ i $ 的任务卸载到服务器时，若服务器分配的资源 $ f_i^{\text{server}} $ 刚好满足延迟约束 $ t_i^{\text{off}} = t_i^{\text{max}} $，则称此资源量为**最小可接受资源** $ f_i^{\text{min}} $。  

**推导过程**：  
由任务延迟约束：  
$$
t_i^{\text{off}} = \frac{L_i}{R_{i,\text{server}}} + \frac{L_i C_i}{f_i^{\text{server}}} = t_i^{\text{max}}
$$  
解得：  
$$
f_i^{\text{min}} = \frac{L_i C_i}{t_i^{\text{max}} - \frac{L_i}{R_{i,\text{server}}}} \quad \text{（需满足 } t_i^{\text{max}} > \frac{L_i}{R_{i,\text{server}}} \text{）}
$$  
**物理意义**：  
- 若服务器分配 $ f_i^{\text{server}} < f_i^{\text{min}} $，任务延迟超标，用户效用为0。  
- 用户选择卸载时，服务器必须至少分配 $ f_i^{\text{min}} $ 的资源，否则任务无效。  


## **2. 用户与服务器效用函数（最低资源需求下）**  
**用户效用**：  
当 $ f_i^{\text{server}} = f_i^{\text{min}} $ 时，用户效用为：  
$$
U_i(p_i) = V_i - \left( \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} + p_i f_i^{\text{min}} + \mu_i t_i^{\text{max}} \right)
$$  
其中：  
- $ V_i $：任务价值  
- $ \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} $：传输能耗成本  
- $ p_i f_i^{\text{min}} $：支付给服务器的资源费用  
- $ \mu_i t_i^{\text{max}} $：时间成本（固定）  

**服务器效用**：  
$$
U_{\text{server}}(p_i) = p_i f_i^{\text{min}} - \gamma k_c (f_i^{\text{min}})^2 C_i L_i
$$  
其中：  
- $ p_i f_i^{\text{min}} $：服务器收入  
- $ \gamma k_c (f_i^{\text{min}})^2 C_i L_i $：提供资源的成本  


## **3. 纳什议价目标函数**  
**目标**：最大化用户与服务器效用的乘积，即：  
$$
\max_{p_i} \left[ U_i(p_i) \cdot U_{\text{server}}(p_i) \right]
$$  
**约束条件**：  
1. 用户效用非负：  
   $$
   U_i(p_i) \geq 0 \Rightarrow p_i \leq \frac{V_i - \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} - \mu_i t_i^{\text{max}}}{f_i^{\text{min}}}
   $$  
2. 服务器效用非负：  
   $$
   U_{\text{server}}(p_i) \geq 0 \Rightarrow p_i \geq \gamma k_c f_i^{\text{min}} C_i L_i
   $$  
3. 资源约束：  
   $$
   f_i^{\text{min}} = \frac{L_i C_i}{t_i^{\text{max}} - \frac{L_i}{R_{i,\text{server}}}} \quad \text{（需满足 } t_i^{\text{max}} > \frac{L_i}{R_{i,\text{server}}} \text{）}
   $$  


## **4. 最优价格推导**  
**步骤1：目标函数展开**  
$$
F(p_i) = \left( V_i - \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} - p_i f_i^{\text{min}} - \mu_i t_i^{\text{max}} \right) \cdot \left( p_i f_i^{\text{min}} - \gamma k_c (f_i^{\text{min}})^2 C_i L_i \right)
$$  
**步骤2：对 $ F(p_i) $ 求导**  
令 $ x = p_i $，则：  
$$
F(x) = \left( V_i - \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} - \mu_i t_i^{\text{max}} - x f_i^{\text{min}} \right) \cdot \left( x f_i^{\text{min}} - \gamma k_c (f_i^{\text{min}})^2 C_i L_i \right)
$$  
对 $ x $ 求导：  
$$
\frac{dF}{dx} = -f_i^{\text{min}} \cdot \left( x f_i^{\text{min}} - \gamma k_c (f_i^{\text{min}})^2 C_i L_i \right) + \left( V_i - \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} - \mu_i t_i^{\text{max}} - x f_i^{\text{min}} \right) \cdot f_i^{\text{min}}
$$  
化简：  
$$
\frac{dF}{dx} = f_i^{\text{min}} \cdot \left[ -x f_i^{\text{min}} + \gamma k_c (f_i^{\text{min}})^2 C_i L_i + V_i - \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} - \mu_i t_i^{\text{max}} - x f_i^{\text{min}} \right]
$$  
$$
= f_i^{\text{min}} \cdot \left[ V_i - \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} - \mu_i t_i^{\text{max}} + \gamma k_c (f_i^{\text{min}})^2 C_i L_i - 2x f_i^{\text{min}} \right]
$$  
令导数为0：  
$$
V_i - \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} - \mu_i t_i^{\text{max}} + \gamma k_c (f_i^{\text{min}})^2 C_i L_i - 2x f_i^{\text{min}} = 0
\Rightarrow x = \frac{V_i - \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} - \mu_i t_i^{\text{max}} + \gamma k_c (f_i^{\text{min}})^2 C_i L_i}{2 f_i^{\text{min}}}
$$  

**步骤3：最优价格表达式**  
$$
p_i^* = \frac{V_i - \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} - \mu_i t_i^{\text{max}} + \gamma k_c (f_i^{\text{min}})^2 C_i L_i}{2 f_i^{\text{min}}}
$$  
**代入 $ f_i^{\text{min}} = \frac{L_i C_i}{t_i^{\text{max}} - \frac{L_i}{R_{i,\text{server}}}} $**：  
$$
p_i^* = \frac{V_i - \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} - \mu_i t_i^{\text{max}} + \gamma k_c \cdot \left( \frac{L_i C_i}{t_i^{\text{max}} - \frac{L_i}{R_{i,\text{server}}}} \right)^2 \cdot C_i L_i}{2 \cdot \frac{L_i C_i}{t_i^{\text{max}} - \frac{L_i}{R_{i,\text{server}}}}}
$$  
化简：  
$$
p_i^* = \frac{ \left( V_i - \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} - \mu_i t_i^{\text{max}} \right) \left( t_i^{\text{max}} - \frac{L_i}{R_{i,\text{server}}} \right) + \gamma k_c L_i^2 C_i^2 \cdot \frac{L_i C_i}{t_i^{\text{max}} - \frac{L_i}{R_{i,\text{server}}}} }{ 2 L_i C_i }
$$  


## **5. 约束条件验证**  
1. **用户效用非负**：  
   $$
   p_i^* \leq \frac{V_i - \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} - \mu_i t_i^{\text{max}}}{f_i^{\text{min}}}
   $$  
   若不满足，则最优价格取上限 $ p_i^* = \frac{V_i - \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} - \mu_i t_i^{\text{max}}}{f_i^{\text{min}}} $。  

2. **服务器效用非负**：  
   $$
   p_i^* \geq \gamma k_c f_i^{\text{min}} C_i L_i
   $$  
   若不满足，则最优价格取下限 $ p_i^* = \gamma k_c f_i^{\text{min}} C_i L_i $。  


## **6. 总结**  
在最低资源需求 $ f_i^{\text{min}} $ 下，最优价格 $ p_i^* $ 由任务价值 $ V_i $、延迟约束 $ t_i^{\text{max}} $、通信速率 $ R_{i,\text{server}} $ 和成本参数共同决定。通过纳什议价框架，确保用户与服务器的效用均非负，且达到均衡。该策略为两阶段协同优化框架的第一阶段提供了资源分配与定价的基准，后续可通过动态拍卖机制处理服务器过载任务。

---

