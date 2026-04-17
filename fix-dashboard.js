const fs = require('fs');
let file = fs.readFileSync('src/pages/Dashboard.jsx', 'utf8');

const targetStr = `<div className="w-full gap-6 items-stretch" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gridAutoFlow: 'row dense', gap: '1.5rem' }}>`;
const updatedStr = `<div className="dashboard-widgets-grid w-full items-stretch">`;

const logicTarget = `let gridColumnStyle = { gridColumn: 'span 4' };
                                if (item.w === 3) {
                                    gridColumnStyle = { gridColumn: 'span 3' };
                                } else if (item.w === 1) {
                                    gridColumnStyle = { gridColumn: 'span 1' };
                                } else if (item.w === 2) {
                                    gridColumnStyle = { gridColumn: 'span 2' };
                                }

                                return (
                                    <div
                                        key={item.id}
                                        style={isEditMode ? { width: '100%', minHeight: 'auto' } : gridColumnStyle}
                                    >`;

const logicUpdated = `const spanClass = \`widget-span-\${item.w}\`;

                                return (
                                    <div
                                        key={item.id}
                                        className={isEditMode ? "w-full" : spanClass}
                                        style={isEditMode ? { minHeight: 'auto' } : {}}
                                    >`;

if (file.includes(targetStr)) {
    file = file.replace(targetStr, updatedStr);
    file = file.replace(logicTarget, logicUpdated);
    fs.writeFileSync('src/pages/Dashboard.jsx', file);
    console.log("Replaced successfully!");
} else {
    console.log("Could not find target strings.");
}
