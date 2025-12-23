'use client'

import SociologyBarChart from '@/components/charts/SociologyBarChart'
import SociologyLineChart from '@/components/charts/SociologyLineChart'
import SociologyPieChart from '@/components/charts/SociologyPieChart'

export default function DataVisualizationPage() {
  // 调查数据
  const surveyData = [
    { category: '非常同意', value: 245 },
    { category: '同意', value: 387 },
    { category: '中立', value: 156 },
    { category: '不同意', value: 98 },
    { category: '非常不同意', value: 54 },
  ]

  // 人口趋势数据
  const populationData = [
    { year: '2015', 城市人口: 820, 农村人口: 603 },
    { year: '2016', 城市人口: 842, 农村人口: 589 },
    { year: '2017', 城市人口: 865, 农村人口: 574 },
    { year: '2018', 城市人口: 888, 农村人口: 560 },
    { year: '2019', 城市人口: 912, 农村人口: 545 },
    { year: '2020', 城市人口: 936, 农村人口: 531 },
    { year: '2021', 城市人口: 960, 农村人口: 516 },
    { year: '2022', 城市人口: 985, 农村人口: 502 },
    { year: '2023', 城市人口: 1010, 农村人口: 487 },
    { year: '2024', 城市人口: 1035, 农村人口: 473 },
  ]

  // 教育程度数据
  const educationData = [
    { name: '研究生及以上', value: 156 },
    { name: '本科', value: 423 },
    { name: '专科', value: 287 },
    { name: '高中/中专', value: 198 },
    { name: '初中及以下', value: 136 },
  ]

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <div className="space-y-2 pt-6 pb-8 md:space-y-5">
        <h1 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
          社会学数据可视化示例
        </h1>
        <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
          使用 Recharts 图表库展示社会学研究数据
        </p>
      </div>

      <div className="container py-12">
        <div className="prose dark:prose-invert max-w-none">
          <h2>1. 调查结果分布（条形图）</h2>
          <p>以下是一个关于社会态度调查的结果展示：</p>

          <SociologyBarChart
            data={surveyData}
            dataKey="value"
            title="社会态度调查结果（N=940）"
            xAxisLabel="态度类别"
            yAxisLabel="人数"
            color="#3b82f6"
          />

          <h3>数据解读</h3>
          <p>
            从上图可以看出，大多数受访者对该议题持正面态度（同意+非常同意占67.2%），
            这表明社会对此问题存在较强的共识。
          </p>

          <h2>2. 人口趋势变化（折线图）</h2>
          <p>下图展示了过去十年的人口统计趋势：</p>

          <SociologyLineChart
            data={populationData}
            dataKeys={['城市人口', '农村人口']}
            title="城乡人口变化趋势（2015-2024）"
            xAxisLabel="年份"
            yAxisLabel="人口（万人）"
            colors={['#3b82f6', '#ef4444']}
          />

          <h3>趋势分析</h3>
          <p>
            数据显示城市化进程持续推进，城市人口稳定增长，而农村人口逐年下降，
            这反映了快速城市化带来的社会结构变迁。
          </p>

          <h2>3. 教育程度分布（饼图）</h2>
          <p>以下饼图展示了样本群体的教育程度分布：</p>

          <SociologyPieChart
            data={educationData}
            title="受访者教育程度分布（N=1200）"
            colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']}
          />

          <h3>分布特征</h3>
          <p>
            样本显示较高的教育水平，本科及以上学历占比约48.3%，
            这可能与调查区域的经济发展水平和人口结构有关。
          </p>

          <h2>结论</h2>
          <p>
            通过 Recharts 图表库，我们可以直观地展示社会学研究数据，
            帮助读者更好地理解研究发现。这些可视化工具在呈现调查结果、
            趋势分析和比例分布时特别有效。
          </p>

          <h2>技术说明</h2>
          <p>本页面使用的图表组件：</p>
          <ul>
            <li>
              <code>SociologyBarChart</code> - 条形图组件
            </li>
            <li>
              <code>SociologyLineChart</code> - 折线图组件
            </li>
            <li>
              <code>SociologyPieChart</code> - 饼图组件
            </li>
          </ul>
          <p>所有组件都支持响应式设计，在不同设备上都能良好显示。</p>
        </div>
      </div>
    </div>
  )
}
