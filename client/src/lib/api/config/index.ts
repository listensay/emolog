import { request } from '$lib/utils/request';
import type { ApiResponse } from '$lib/types';

/**
 * 网站配置类型
 */
export interface SiteConfig {
	site_title: string;
	site_description: string;
	site_icon: string;
	site_logo: string;
	site_keywords: string;
	site_footer: string;
	[key: string]: string;
}

/**
 * 设置配置项参数
 */
export interface SetConfigParams {
	key: string;
	value?: string;
}

/**
 * 批量设置配置项参数
 */
export interface SetConfigsParams {
	configs: SetConfigParams[];
}

/**
 * 获取所有配置
 */
export const getAllConfigs = (): Promise<ApiResponse<SiteConfig>> => {
	return request.get<ApiResponse<SiteConfig>>('/config');
};

/**
 * 获取指定配置
 */
export const getConfigs = (keys: string[]): Promise<ApiResponse<Partial<SiteConfig>>> => {
	return request.get<ApiResponse<Partial<SiteConfig>>>('/config/keys', {
		params: { keys: keys.join(',') }
	});
};

/**
 * 获取单个配置
 */
export const getConfig = (key: string): Promise<ApiResponse<{ key: string; value: string | null }>> => {
	return request.get<ApiResponse<{ key: string; value: string | null }>>(`/config/${key}`);
};

/**
 * 批量设置配置
 */
export const setConfigs = (params: SetConfigsParams): Promise<ApiResponse<SiteConfig>> => {
	return request.post<ApiResponse<SiteConfig>>('/config', params);
};

/**
 * 设置单个配置
 */
export const setConfig = (key: string, value: string): Promise<ApiResponse<{ key: string; value: string }>> => {
	return request.post<ApiResponse<{ key: string; value: string }>>(`/config/${key}`, { key, value });
};

/**
 * 删除配置
 */
export const deleteConfig = (key: string): Promise<ApiResponse<null>> => {
	return request.delete<ApiResponse<null>>(`/config/${key}`);
};
