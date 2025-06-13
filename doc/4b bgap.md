### 推导和分析非约束区域下的讨价还价

以下是对非约束区域下讨价还价过程的完整推导与分析。我们将从定义出发，逐步推导用户和服务器的效用函数，确定价格的可行范围，并说明如何通过遗传算法实现最优解。

---

#### **1. 非约束区域的定义**

在 Bargain-GA 算法中，**非约束区域** 是指价格 \( p_i \) 满足 \( p_i \leq p_i^{\text{switch}} \) 的情况。在这个区域内，用户没有严格的时间约束，其资源请求量 \( f_i^{\text{server}} \) 是通过优化自身效用得到的，表达式为：

\[
f_i^{\text{server}} = \sqrt{\frac{\mu_i L_i C_i}{p_i}}
\]

其中：
- \( \mu_i \)：用户的资源价值参数；
- \( L_i \)：任务长度；
- \( C_i \)：任务复杂度；
- \( p_i \)：单位资源价格。

---

#### **2. 用户和服务器的效用函数**

在非约束区域内，我们将 \( f_i^{\text{server}} = \sqrt{\frac{\mu_i L_i C_i}{p_i}} \) 代入用户和服务器的效用函数中进行推导。

##### **用户的效用函数 \( U_i^{\text{off}} \)**

用户的效用定义为：

\[
U_i^{\text{off}} = V_i - \left( \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} + p_i f_i^{\text{server}} + \mu_i \left( \frac{L_i}{R_{i,\text{server}}} + \frac{L_i C_i}{f_i^{\text{server}}} \right) \right)
\]

其中：
- \( V_i \)：任务完成带来的收益；
- \( \gamma \)：系统参数；
- \( \theta_i \)：用户的延迟敏感参数；
- \( R_{i,\text{server}} \)：服务器的传输速率。

代入 \( f_i^{\text{server}} = \sqrt{\frac{\mu_i L_i C_i}{p_i}} \)，得到：

\[
U_i^{\text{off}} = V_i - \gamma \theta_i \frac{L_i}{R_{i,\text{server}}} - p_i \sqrt{\frac{\mu_i L_i C_i}{p_i}} - \mu_i \frac{L_i}{R_{i,\text{server}}} - \mu_i L_i C_i \left( \frac{1}{\sqrt{\frac{\mu_i L_i C_i}{p_i}}} \right)
\]

化简每项：
- \( p_i \sqrt{\frac{\mu_i L_i C_i}{p_i}} = \sqrt{p_i \mu_i L_i C_i} \)；
- \( \mu_i L_i C_i \cdot \sqrt{\frac{p_i}{\mu_i L_i C_i}} = \sqrt{p_i \mu_i L_i C_i} \)。

于是：

\[
U_i^{\text{off}} = V_i - \left( \gamma \theta_i + \mu_i \right) \frac{L_i}{R_{i,\text{server}}} - \sqrt{p_i \mu_i L_i C_i} - \sqrt{p_i \mu_i L_i C_i}
\]

\[
U_i^{\text{off}} = V_i - \left( \gamma \theta_i + \mu_i \right) \frac{L_i}{R_{i,\text{server}}} - 2 \sqrt{p_i \mu_i L_i C_i}
\]

##### **服务器的效用函数 \( U_{\text{server}} \)**

服务器的效用定义为：

\[
U_{\text{server}} = p_i f_i^{\text{server}} - \gamma k_c \left( f_i^{\text{server}} \right)^2 C_i L_i
\]

其中：
- \( k_c \)：服务器的成本系数。

代入 \( f_i^{\text{server}} = \sqrt{\frac{\mu_i L_i C_i}{p_i}} \)，得到：

\[
U_{\text{server}} = p_i \sqrt{\frac{\mu_i L_i C_i}{p_i}} - \gamma k_c \left( \sqrt{\frac{\mu_i L_i C_i}{p_i}} \right)^2 C_i L_i
\]

化简：
- \( p_i \sqrt{\frac{\mu_i L_i C_i}{p_i}} = \sqrt{p_i \mu_i L_i C_i} \)；
- \( \left( \sqrt{\frac{\mu_i L_i C_i}{p_i}} \right)^2 C_i L_i = \frac{\mu_i L_i C_i}{p_i} \cdot C_i L_i = \frac{\mu_i L_i^2 C_i^2}{p_i} \)。

于是：

\[
U_{\text{server}} = \sqrt{p_i \mu_i L_i C_i} - \gamma k_c \frac{\mu_i L_i^2 C_i^2}{p_i}
\]

---

#### **3. 讨价还价的目标**

讨价还价的目标是最大化用户和服务器效用的乘积：

\[
U_i^{\text{off}} \times U_{\text{server}} = \left[ V_i - \left( \gamma \theta_i + \mu_i \right) \frac{L_i}{R_{i,\text{server}}} - 2 \sqrt{p_i \mu_i L_i C_i} \right] \left[ \sqrt{p_i \mu_i L_i C_i} - \gamma k_c \frac{\mu_i L_i^2 C_i^2}{p_i} \right]
\]

这个函数关于 \( p_i \) 包含 \( \sqrt{p_i} \) 和 \( \frac{1}{p_i} \) 项，形式复杂，难以直接通过解析方法求导得到最优 \( p_i \)。因此，Bargain-GA 算法采用遗传算法在可行范围内数值求解。

---

#### **4. 价格的可行范围**

在非约束区域内，\( p_i \) 的取值需满足以下约束：

##### **下界：服务器成本价格 \( p_{\text{server},i}^{\text{cost}} \)**

服务器要求价格至少覆盖其成本：

\[
p_{\text{server},i}^{\text{cost}} = \gamma^{2/3} k_c^{2/3} \mu_i^{1/3} L_i C_i
\]

##### **上界：用户效用约束 \( p_i^{\text{minimalUtility}} \) 和切换价格 \( p_i^{\text{switch}} \)**

1. **用户效用约束**：要求 \( U_i^{\text{off}} \geq \alpha V_i \)，其中 \( \alpha \) 是用户效用的最低比例。将用户效用代入：

\[
V_i - \left( \gamma \theta_i + \mu_i \right) \frac{L_i}{R_{i,\text{server}}} - 2 \sqrt{p_i \mu_i L_i C_i} \geq \alpha V_i
\]

整理并解不等式：

\[
2 \sqrt{p_i \mu_i L_i C_i} \leq (1 - \alpha) V_i - \left( \gamma \theta_i + \mu_i \right) \frac{L_i}{R_{i,\text{server}}}
\]

\[
\sqrt{p_i} \leq \frac{(1 - \alpha) V_i - \left( \gamma \theta_i + \mu_i \right) \frac{L_i}{R_{i,\text{server}}}}{2 \sqrt{\mu_i L_i C_i}}
\]

\[
p_i \leq \left[ \frac{(1 - \alpha) V_i - \left( \gamma \theta_i + \mu_i \right) \frac{L_i}{R_{i,\text{server}}}}{2 \sqrt{\mu_i L_i C_i}} \right]^2 = p_i^{\text{minimalUtility}}
\]

2. **切换价格 \( p_i^{\text{switch}} \)**：非约束区域的上限为：

\[
p_i^{\text{switch}} = \frac{\mu_i L_i C_i}{(f_i^{\text{min}})^2}
\]

其中 \( f_i^{\text{min}} \) 是用户的最小资源需求。

综合考虑，\( p_i \) 的可行范围为：

\[
p_i \in \left[ p_{\text{server},i}^{\text{cost}}, \min\left( p_i^{\text{switch}}, p_i^{\text{minimalUtility}} \right) \right]
\]

---

#### **5. 遗传算法求解**

由于效用乘积函数复杂，Bargain-GA 算法使用遗传算法在上述范围内搜索最优 \( p_i \)。具体步骤如下：

- **初始化**：在 \( [p_{\text{server},i}^{\text{cost}}, \min(p_i^{\text{switch}}, p_i^{\text{minimalUtility}})] \) 内随机生成一组 \( p_i \) 作为初始种群。
- **适应度评估**：以 \( U_i^{\text{off}} \times U_{\text{server}} \) 作为适应度函数，衡量每个 \( p_i \) 的优劣。
- **遗传操作**：通过选择、交叉和变异生成新一代候选解。
- **迭代优化**：重复上述步骤，直至收敛到使效用乘积最大的 \( p_i \)。

---

#### **6. 总结**

在非约束区域下，讨价还价的过程是通过遗传算法在 \( [p_{\text{server},i}^{\text{cost}}, \min(p_i^{\text{switch}}, p_i^{\text{minimalUtility}})] \) 范围内搜索最优价格 \( p_i \)，以最大化 \( U_i^{\text{off}} \times U_{\text{server}} \)。这种方法充分利用了遗传算法在复杂优化问题中的优势，确保了用户和服务器双方效用的均衡与最大化。