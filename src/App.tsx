import { useState, useRef, useEffect } from 'react'
import type { KeyboardEvent, ChangeEvent } from 'react'
import './App.css'

function App() {
  const [lines, setLines] = useState<string[]>([''])
  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [showAll, setShowAll] = useState(false)
  const textareaRefs = useRef<(HTMLTextAreaElement | null)[]>([])

  // Auto-resize textarea
  const adjustHeight = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  useEffect(() => {
    if (!showAll) {
      const activeEl = textareaRefs.current[activeIndex]
      if (activeEl) {
        activeEl.focus()
        adjustHeight(activeEl)
      }
    }
  }, [activeIndex, showAll])

  const handleChange = (index: number, e: ChangeEvent<HTMLTextAreaElement>) => {
    const newLines = [...lines]
    newLines[index] = e.target.value
    setLines(newLines)
    adjustHeight(e.target)
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const newLines = [...lines]
      newLines.splice(index + 1, 0, '')
      setLines(newLines)
      setActiveIndex(index + 1)
    } else if (e.key === 'Backspace' && lines[index] === '' && lines.length > 1) {
      e.preventDefault()
      const newLines = lines.filter((_, i) => i !== index)
      setLines(newLines)
      setActiveIndex(Math.max(0, index - 1))
    } else if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault()
      setActiveIndex(index - 1)
    } else if (e.key === 'ArrowDown' && index < lines.length - 1) {
      e.preventDefault()
      setActiveIndex(index + 1)
    }
  }

  const handleCopy = async () => {
    const text = lines.join('\n')
    try {
      await navigator.clipboard.writeText(text)
      alert('已複製全部內容！')
    } catch (err) {
      console.error('複製失敗:', err)
    }
  }

  const toggleShowAll = () => {
    setShowAll(!showAll)
    // When returning to focus mode, focus the last active line
    if (showAll) {
      // Small timeout to let state update and render happen
      setTimeout(() => {
        const activeEl = textareaRefs.current[activeIndex]
        activeEl?.focus()
      }, 0)
    }
  }

  return (
    <>
      <div className="controls">
        <button onClick={toggleShowAll} className="control-btn" title={showAll ? "專注模式" : "顯示全部"}>
          {showAll ? '👁️‍🗨️' : '👁️'}
        </button>
        <button onClick={handleCopy} className="control-btn" title="複製全部">
          📋
        </button>
      </div>

      <div className={`document-container ${showAll ? 'show-all' : ''}`} onClick={(e) => {
        if (e.target === e.currentTarget && !showAll) {
          setActiveIndex(lines.length - 1)
        }
      }}>
        {lines.map((line, index) => (
          <div 
            key={index} 
            className={`line-wrapper ${!showAll && index !== activeIndex ? 'blurred' : ''}`} 
            onClick={() => setActiveIndex(index)}
          >
            <textarea
              ref={(el) => { textareaRefs.current[index] = el }}
              value={line}
              onChange={(e) => handleChange(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="line-input"
              rows={1}
              placeholder={index === 0 && lines.length === 1 ? "開始輸入..." : ""}
              readOnly={!showAll && index !== activeIndex} 
            />
          </div>
        ))}
      </div>
    </>
  )
}

export default App
