"""
Custom template tags for admin pages
"""
from django import template

register = template.Library()


@register.filter
def get_item(dictionary, key):
    """Get item from dictionary by key"""
    if isinstance(dictionary, dict):
        key_str = str(key)
        result = dictionary.get(key_str, {})
        # If result is a dict, return it; if it's a list, return it; otherwise return empty dict
        if isinstance(result, (dict, list)):
            return result
        return {}
    return {}

