#!/usr/bin/env python3
import os
import re

# Patterns to find and replace for adding animations
pages_to_animate = [
    "/vercel/share/v0-project/app/adherent/reservations/page.tsx",
    "/vercel/share/v0-project/app/adherent/mon-compte/page.tsx",
    "/vercel/share/v0-project/app/bibliothecaire/page.tsx",
    "/vercel/share/v0-project/app/bibliothecaire/livres/page.tsx",
    "/vercel/share/v0-project/app/bibliothecaire/adherents/page.tsx",
    "/vercel/share/v0-project/app/bibliothecaire/emprunts/page.tsx",
    "/vercel/share/v0-project/app/bibliothecaire/reservations/page.tsx",
    "/vercel/share/v0-project/app/bibliothecaire/amendes/page.tsx",
    "/vercel/share/v0-project/app/bibliothecaire/rapports/page.tsx",
]

def add_animations_to_file(filepath):
    """Add animation classes to a page file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add animations to header div
        content = re.sub(
            r'<div>\s*<h1 className="text-3xl font-bold',
            '<div className="animate-slideInDown">\n        <h1 className="text-3xl font-bold',
            content
        )
        
        # Add animations to Card components (pattern: <Card>)
        # Add stagger-item animate-slideInUp hover-lift to stat cards
        card_count = 0
        def replace_cards(match):
            nonlocal card_count
            card_count += 1
            if card_count <= 4:  # First 4 cards are usually stats
                return f'<Card className="stagger-item animate-slideInUp hover-lift">'
            return match.group(0)
        
        content = re.sub(r'<Card>', replace_cards, content)
        
        # Add animations to grids
        content = re.sub(
            r'<div className="grid grid-cols-1',
            '<div className="grid grid-cols-1 animate-fadeIn',
            content,
            count=1
        )
        
        # Add animations to lists
        content = re.sub(
            r'<div className="space-y-\d+">(\s+{[^}]*\.map)',
            r'<div className="space-y-4 animate-fadeIn">\1',
            content
        )
        
        # Add animations to buttons
        content = re.sub(
            r'<Button\s+className="([^"]*)"',
            lambda m: f'<Button className="{m.group(1)} transition-smooth hover-scale"' if 'transition-smooth' not in m.group(1) else f'<Button className="{m.group(1)}"',
            content
        )
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✓ Animated: {filepath}")
        return True
    except Exception as e:
        print(f"✗ Error in {filepath}: {str(e)}")
        return False

# Process all pages
success_count = 0
for page in pages_to_animate:
    if os.path.exists(page):
        if add_animations_to_file(page):
            success_count += 1
    else:
        print(f"⚠ File not found: {page}")

print(f"\n✓ Successfully animated {success_count}/{len(pages_to_animate)} pages")
