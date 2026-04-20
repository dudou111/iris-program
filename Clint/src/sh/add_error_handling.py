#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为Vue文件添加uni-app API的错误处理
"""

import re
import os
import glob

def add_error_handling_to_navigateTo(content):
    """
    为 uni.navigateTo 添加错误处理
    """
    # 匹配 uni.navigateTo({ url: '...' })
    pattern = r'uni\.navigateTo\(\{\s*url:\s*([^\}]+)\s*\}\)'

    def replace_navigate(match):
        url = match.group(1).strip()
        return f'''uni.navigateTo({{
    url: {url},
    fail: (err) => {{
      console.error('页面跳转失败:', err)
    }}
  }})'''

    result = re.sub(pattern, replace_navigate, content)
    return result

def add_error_handling_to_showToast(content):
    """
    为 uni.showToast 添加 duration 参数
    """
    # 匹配没有duration的showToast
    pattern = r'uni\.showToast\(\{([^\}]*)\}\)'

    def replace_toast(match):
        params = match.group(1)
        # 如果已经有duration，跳过
        if 'duration' in params:
            return match.group(0)
        # 添加duration
        return f'uni.showToast({{{params},\n      duration: 2000\n    }})'

    result = re.sub(pattern, replace_toast, content)
    return result

def add_error_handling_to_request(content):
    """
    为 uni.request 添加 Promise 封装和错误处理
    """
    # 这个比较复杂，暂时跳过，需要手动处理
    return content

def add_input_attributes(content):
    """
    为 input 标签添加跨平台属性
    """
    # 查找所有input标签
    pattern = r'<input([^>]*?)>'

    def replace_input(match):
        attrs = match.group(1)

        # 如果已经有这些属性，跳过
        if 'adjust-position' in attrs:
            return match.group(0)

        # 添加跨平台属性
        new_attrs = attrs
        if 'adjust-position' not in attrs:
            new_attrs += '\n            :adjust-position="true"'
        if 'hold-keyboard' not in attrs:
            new_attrs += '\n            :hold-keyboard="false"'
        if 'cursor-spacing' not in attrs:
            new_attrs += '\n            :cursor-spacing="50"'
        if 'placeholder-style' not in attrs:
            new_attrs += '\n            placeholder-style="color: #999;"'

        return f'<input{new_attrs}\n          >'

    result = re.sub(pattern, replace_input, content)
    return result

def process_vue_file(file_path):
    """
    处理单个Vue文件
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # 添加各种错误处理
        content = add_error_handling_to_navigateTo(content)
        content = add_error_handling_to_showToast(content)
        content = add_input_attributes(content)

        # 如果内容有变化，写回文件
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'✓ 已优化: {file_path}')
            return True
        else:
            print(f'⊙ 无需修改: {file_path}')
            return False
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
    print('开始添加错误处理...\n')

    modified_count = 0
    skipped_count = 0

    for vue_file in vue_files:
        if process_vue_file(vue_file):
            modified_count += 1
        else:
            skipped_count += 1

    print(f'\n优化完成!')
    print(f'已修改: {modified_count} 个文件')
    print(f'跳过: {skipped_count} 个文件')

if __name__ == '__main__':
    main()
