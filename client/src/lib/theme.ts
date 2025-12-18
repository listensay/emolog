/**
 * 主题颜色配置
 * 修改这里的颜色,全站主题色都会改变
 */
export const theme = {
	// 主题色 - 绿色系
	primary: {
		50: '#f0fdf4',
		100: '#dcfce7',
		200: '#bbf7d0',
		300: '#86efac',
		400: '#4ade80',  // emerald-400
		500: '#22c55e',  // emerald-500
		600: '#16a34a',  // emerald-600
		700: '#15803d',  // emerald-700
		800: '#166534',
		900: '#14532d'
	},
	// 辅助色 - 青色系
	secondary: {
		50: '#f0fdfa',
		100: '#ccfbf1',
		200: '#99f6e4',
		300: '#5eead4',
		400: '#2dd4bf',  // teal-400
		500: '#14b8a6',  // teal-500
		600: '#0d9488',  // teal-600
		700: '#0f766e',
		800: '#115e59',
		900: '#134e4a'
	},
	// 中性色
	neutral: {
		50: '#f8fafc',   // slate-50
		100: '#f1f5f9',  // slate-100
		200: '#e2e8f0',  // slate-200
		300: '#cbd5e1',  // slate-300
		400: '#94a3b8',  // slate-400
		500: '#64748b',  // slate-500
		600: '#475569',  // slate-600
		700: '#334155',  // slate-700
		800: '#1e293b',  // slate-800
		900: '#0f172a'   // slate-900
	},
	// 功能色
	success: '#22c55e',   // green-500
	error: '#ef4444',     // red-500
	warning: '#f59e0b',   // amber-500
	info: '#3b82f6'       // blue-500
} as const;

/**
 * Tailwind 类名映射
 * 使用这些常量代替硬编码的 Tailwind 类名
 */
export const colors = {
	// 主色
	primary: {
		bg: 'bg-emerald-600',
		bgHover: 'hover:bg-emerald-700',
		text: 'text-emerald-600',
		textHover: 'hover:text-emerald-700',
		border: 'border-emerald-600',
		ring: 'ring-emerald-500',
		focusRing: 'focus:ring-emerald-500',
		shadow: 'shadow-emerald-500/50',
		gradient: 'from-emerald-400 to-teal-400',
		gradientAlt: 'from-emerald-500 to-teal-600'
	},
	// 辅助色
	secondary: {
		bg: 'bg-teal-500',
		bgHover: 'hover:bg-teal-600',
		text: 'text-teal-600',
		border: 'border-teal-500',
		ring: 'ring-teal-500'
	},
	// 中性色
	neutral: {
		bg: 'bg-slate-900',
		bgLight: 'bg-slate-50',
		text: 'text-slate-900',
		textLight: 'text-slate-600',
		textMuted: 'text-slate-500',
		border: 'border-slate-200',
		borderDark: 'border-slate-800'
	}
} as const;

/**
 * 预设的组合样式
 */
export const presets = {
	// 主按钮
	buttonPrimary: `${colors.primary.bg} text-white ${colors.primary.bgHover} `,
	// 输入框焦点
	inputFocus: `focus:outline-none focus:ring-2 ${colors.primary.focusRing} focus:border-transparent`,
	// 复选框
	checkbox: `rounded border-slate-300 ${colors.primary.text} ${colors.primary.focusRing}`,
	// 活跃菜单项
	activeMenuItem: `${colors.primary.bg} text-white shadow-lg ${colors.primary.shadow}`,
	// 渐变卡片
	gradientCard: `bg-gradient-to-r ${colors.primary.gradientAlt} rounded-xl p-6 text-white`,
	// 链接样式
	link: `${colors.primary.text} ${colors.primary.textHover} transition-colors`,
	// 用户头像
	avatar: `bg-gradient-to-br from-emerald-500 to-teal-500`,
} as const;
