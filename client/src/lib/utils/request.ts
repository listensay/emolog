import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { BusinessCode } from '$lib/types';

// API 基础配置
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TIMEOUT = 10000;

// 创建 axios 实例
const service: AxiosInstance = axios.create({
	baseURL: BASE_URL,
	timeout: TIMEOUT,
	headers: {
		'Content-Type': 'application/json'
	}
});

// 请求拦截器
service.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		// 从 localStorage 获取 token
		const token = localStorage.getItem('token');
		if (token && config.headers) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		console.error('请求错误:', error);
		return Promise.reject(error);
	}
);

// 响应拦截器
service.interceptors.response.use(
	(response: AxiosResponse) => {
		const res = response.data;

		/**
		 * 响应处理说明：
		 *
		 * HTTP 状态码 200 有两种情况：
		 * 1. 业务成功：success === true, code === 2000
		 * 2. 业务失败：success === false, code !== 2000（如密码错误 4102）
		 *
		 * 只有真正的网络层面错误才会返回非 200 的 HTTP 状态码：
		 * - HTTP 401: Token 失效、未登录（需要重新登录）
		 * - HTTP 403: 权限不足
		 * - HTTP 404: 资源不存在
		 * - HTTP 500: 服务器错误
		 */

		// 检查业务是否成功
		if (res.success === false) {
			// 业务失败，但 HTTP 请求成功（状态码 200）
			console.error('业务错误:', `[${res.code}] ${res.message}`);

			// 处理特定的业务错误码
			switch (res.code) {
				case BusinessCode.INVALID_CREDENTIALS:
					// 用户名或密码错误 - 不做特殊处理，由页面显示错误
					console.log('登录凭证无效');
					break;
				case BusinessCode.ACCOUNT_DISABLED:
					// 账号被禁用
					console.error('账号已被禁用');
					break;
				case BusinessCode.USER_NOT_FOUND:
					// 用户不存在
					console.log('用户不存在');
					break;
				default:
					// 其他业务错误
					console.error(`业务错误 [${res.code}]: ${res.message}`);
			}

			// 业务失败时，抛出错误供 catch 捕获
			return Promise.reject(new Error(res.message || '操作失败'));
		}

		// 业务成功，返回完整的响应数据
		return res;
	},
	(error) => {
		/**
		 * 处理 HTTP 错误（网络层面的错误）
		 * 只有非 200 的状态码才会进入这里
		 */
		console.error('HTTP 错误:', error.message);

		// 处理 HTTP 状态码错误
		if (error.response) {
			const { status, data } = error.response;

			console.error(`HTTP 状态码: ${status}`);

			// 优先使用后端返回的错误信息
			const message = data?.message || error.message;

			// HTTP 状态码的处理
			switch (status) {
				case 401:
					// HTTP 401: 未授权（Token 失效、未登录等）
					console.error('未授权，需要重新登录');
					localStorage.removeItem('token');
					localStorage.removeItem('user');
					window.location.href = '/auth/login';
					break;
				case 403:
					// HTTP 403: 禁止访问
					console.error('没有权限访问');
					break;
				case 404:
					// HTTP 404: 资源不存在
					console.error('请求的资源不存在');
					break;
				case 500:
					// HTTP 500: 服务器错误
					console.error('服务器内部错误');
					break;
				case 502:
				case 503:
				case 504:
					// 网关错误或服务不可用
					console.error('服务暂时不可用，请稍后重试');
					break;
				default:
					console.error(`HTTP 请求失败: ${status}`);
			}

			// 将后端的错误信息传递出去
			return Promise.reject(new Error(message));
		} else if (error.request) {
			// 请求已发送但没有收到响应（网络问题）
			console.error('网络错误: 无法连接到服务器');
			return Promise.reject(new Error('网络错误，请检查网络连接'));
		} else {
			// 其他错误
			console.error('请求错误:', error.message);
			return Promise.reject(error);
		}
	}
);

// 封装请求方法
export const request = {
	get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
		return service.get(url, config);
	},

	post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
		return service.post(url, data, config);
	},

	put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
		return service.put(url, data, config);
	},

	delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
		return service.delete(url, config);
	},

	patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
		return service.patch(url, data, config);
	}
};

export default service;
