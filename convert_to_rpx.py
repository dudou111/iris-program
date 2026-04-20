#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量将Vue文件中的px单位转换为rpx单位
"""

import re
import os
import glob

def convert_px_to_rpx(content):
    """
    将CSS中的px单位转换为rpx单位
    规则: 1px = 2rpx (设计稿通常是750px宽度)
    """
    def replace_px(match):
        value = match.group(1)
        # 跳过0px
        if value == '0':
            return '0'
        # 转换为rpx (1px = 2rpx)
        try:
            px_value = float(value)
            rpx_value = int(px_value * 2)
            return f'{rpx_value}rpx'
        except:
            return match.group(0)

    # 匹配 数字+px 的模式，但不匹配已经是rpx的
    pattern = r'(\d+(?:\.\d+)?)px(?!;?\s*\/\*.*rpx)'
    result = re.sub(pattern, replace_px, content)

    return result

def add_platform_specific_styles(content):
    """
    添加平台特定的样式注释
    """
    # 检查是否已经有条件编译注释
    if '/* #ifdef' in content or '/* #ifndef' in content:
        return content

    # 在style标签后添加注释说明
    style_pattern = r'(<style[^>]*>)'
    replacement = r'\1\n/* 已优化为跨平台样式，使用rpx单位 */\n/* 使用 #ifdef H5 / #ifdef MP 添加平台特定样式 */\n'
    result = re.sub(style_pattern, replacement, content)

    return result

def process_vue_file(file_path):
    """
    处理单个Vue文件
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 备份原文件
        backup_path = file_path + '.backup'
        if not os.path.exists(backup_path):
            with open(backup_path, 'w', encoding='utf-8') as f:
                f.write(content)

        # 转换px为rpx
        new_content = convert_px_to_rpx(content)

        # 添加平台特定样式注释
        new_content = add_platform_specific_styles(new_content)

        # 写回文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f'✓ 已处理: {file_path}')
        return True
    except Exception as e:
        print(f'✗ 处理失败 {file_path}: {str(e)}')
        return False

def main():
    """
    主函数
    """
    # 获取所有Vue文件
    pages_dir = 'src/pages'
    vue_files = glob.glob(f'{pages_dir}/**/*.vue', recursive=True)

    print(f'找到 {len(vue_files)} 个Vue文件')
    print('开始转换...\n')

    success_count = 0
    fail_count = 0

    for vue_file in vue_files:
        # 跳过已经处理过的文件
        if 'login' in vue_file or 'register' in vue_file:
            print(f'⊙ 跳过已处理: {vue_file}')
            continue

        if process_vue_file(vue_file):
            success_count += 1
        else:
            fail_count += 1

    print(f'\n转换完成!')
    print(f'成功: {success_count} 个文件')
    print(f'失败: {fail_count} 个文件')
    print(f'\n备份文件已保存为 .backup 后缀')

if __name__ == '__main__':
    main()
