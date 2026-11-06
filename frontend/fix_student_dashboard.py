import re

filepath = r'c:\Users\akinb\ALL-DOCS\PGD-Poject-Folder\Project-Folder-Development\cse-hub\frontend\src\app\student\dashboard\page.tsx'
content = open(filepath, 'r', encoding='utf-8').read()

# 1. Add imports: useCurrentUser and Link
content = content.replace(
    "import { useState } from 'react';",
    "import { useState } from 'react';\nimport Link from 'next/link';\nimport { useCurrentUser } from '@/lib/useCurrentUser';"
)

# 2. Add currentUser hook and firstName after useRouter
content = content.replace(
    'const router = useRouter();',
    "const router = useRouter();\n    const currentUser = useCurrentUser();\n    const firstName = (currentUser.full_name || currentUser.username || 'Student').split(' ')[0];"
)

# 3. Remove userName and userCode from Sidebar
content = content.replace(
    '<Sidebar userRole="student" userName="John Doe" userCode="Student" />',
    '<Sidebar userRole="student" />'
)

# 4. Wrap Bell button in Link to /notifications
content = content.replace(
    '<button className="p-2 text-[#0B123D] hover:bg-slate-50 rounded-lg">\n                            <Bell className="w-[20px] h-[20px]" />\n                        </button>',
    '<Link href="/notifications">\n                            <button className="p-2 text-[#0B123D] hover:bg-slate-50 rounded-lg">\n                                <Bell className="w-[20px] h-[20px]" />\n                            </button>\n                        </Link>'
)

# 5. Wrap avatar/name section in Link to /profile and replace hardcoded values
old_avatar = '<div className="flex items-center gap-3 border-l border-[#E1E6F3] pl-4">\n                            <div className="w-[38px] h-[40px] rounded-[22px] bg-[#245CFF]/10 text-[#245CFF] font-bold flex items-center justify-center text-sm">\n                                JD\n                            </div>\n                            <div className="hidden sm:flex flex-col">\n                                <span className="text-[14px] font-bold leading-[20.3px] text-[#0B123D]">John Doe</span>\n                                <span className="text-[12px] text-[#64708C]">Student</span>\n                            </div>\n                        </div>'

new_avatar = '<Link href="/profile" className="flex items-center gap-3 border-l border-[#E1E6F3] pl-4">\n                            <div className="w-[38px] h-[40px] rounded-[22px] bg-[#245CFF]/10 text-[#245CFF] font-bold flex items-center justify-center text-sm">\n                                {currentUser.initials}\n                            </div>\n                            <div className="hidden sm:flex flex-col">\n                                <span className="text-[14px] font-bold leading-[20.3px] text-[#0B123D]">{currentUser.full_name || currentUser.username || \'User\'}</span>\n                                <span className="text-[12px] text-[#64708C]">Student</span>\n                            </div>\n                        </Link>'

content = content.replace(old_avatar, new_avatar)

# 6. Replace Welcome Back, John!
content = content.replace(
    'Welcome Back, John!',
    'Welcome Back, {firstName}!'
)

open(filepath, 'w', encoding='utf-8').write(content)
print('All replacements done successfully')
